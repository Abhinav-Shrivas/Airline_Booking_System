const { BookingRepository } = require("../repositories/index");
const flightClient = require("../utils/flightService.client");
const paymentService = require("../services/payment.service.js");
const bookingService = require("../services/booking.service.js");
const eventPublisher = require("../utils/eventPublisher");

describe("testing create booking function of booking service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockData = {
    userId: 1,
    flightId: 1,
    bookingId: 1,
    noOfSeats: 2,
    passengers: [{ fullName: "xyz1" }, { fullName: "xyz2" }],
    totalSeats: 100,
    price: 5000,
  };

  //Happy Path
  it("create booking function should return booking object with status 'INITIATED'", async () => {
    //mocking functions
    const getFlightSpy = jest
      .spyOn(flightClient, "getFlightById")
      .mockResolvedValue({
        totalSeatsLeft: mockData.totalSeats,
        price: mockData.price,
      });

    const decrementSeatSpy = jest
      .spyOn(flightClient, "decrementSeats")
      .mockResolvedValue();

    const createBookingSpy = jest
      .spyOn(BookingRepository.prototype, "createBookingWithPassengers")
      .mockResolvedValue({
        id: mockData.bookingId,
        userId: mockData.userId,
        flightId: mockData.flightId,
        status: "INITIATED",
      });

    // calling createBooking function
    const result = await bookingService.createBooking(mockData.userId, {
      flightId: mockData.flightId,
      noOfSeats: mockData.noOfSeats,
      passengers: mockData.passengers,
    });

    // checking result
    expect(result).toEqual({
      id: mockData.bookingId,
      userId: mockData.userId,
      flightId: mockData.flightId,
      status: "INITIATED",
    });

    expect(getFlightSpy).toHaveBeenCalledWith(mockData.flightId);
    expect(decrementSeatSpy).toHaveBeenCalledWith(
      mockData.flightId,
      mockData.noOfSeats,
    );
    expect(createBookingSpy).toHaveBeenCalledWith(
      {
        userId: mockData.userId,
        flightId: mockData.flightId,
        noOfSeats: mockData.noOfSeats,
        totalCost: mockData.noOfSeats * mockData.price,
        status: "INITIATED",
      },
      mockData.passengers,
    );
  });

  //ERROR PATHS
  //passengers.length !== noOfSeats
  it("create booking function should throw error if passengers.length !== noOfSeats", async () => {
    await expect(
      bookingService.createBooking(mockData.userId, {
        flightId: mockData.flightId,
        noOfSeats: mockData.noOfSeats - 1,
        passengers: mockData.passengers,
      }),
    ).rejects.toThrow(
      `Passenger count (${mockData.passengers.length}) must match seat count (${mockData.noOfSeats - 1})`,
    );
  });

  //flight.totalSeatsLeft < noOfSeats
  it("create booking function should throw error if flight.totalSeatsLeft < noOfSeats", async () => {
    //mocking functions
    const getFlightSpy = jest
      .spyOn(flightClient, "getFlightById")
      .mockResolvedValue({
        totalSeatsLeft: 1,
        price: mockData.price,
      });

    await expect(
      bookingService.createBooking(mockData.userId, {
        flightId: mockData.flightId,
        noOfSeats: mockData.noOfSeats,
        passengers: mockData.passengers,
      }),
    ).rejects.toThrow(
      `Only 1 seats available, requested ${mockData.noOfSeats}`,
    );
    const decrementSeatSpy = jest.spyOn(flightClient, "decrementSeats");
    expect(getFlightSpy).toHaveBeenCalledWith(mockData.flightId);
    expect(decrementSeatSpy).not.toHaveBeenCalled();
  });

  //createBooking fails
  it("create booking function should release seats back if booking creation fails", async () => {
    //mocking functions
    const getFlightSpy = jest
      .spyOn(flightClient, "getFlightById")
      .mockResolvedValue({
        totalSeatsLeft: mockData.totalSeats,
        price: mockData.price,
      });

    const decrementSeatSpy = jest
      .spyOn(flightClient, "decrementSeats")
      .mockResolvedValue();

    const incrementSeatSpy = jest
      .spyOn(flightClient, "incrementSeats")
      .mockResolvedValue();

    const createBookingSpy = jest
      .spyOn(BookingRepository.prototype, "createBookingWithPassengers")
      .mockRejectedValue(new Error("booking creation failed"));

    // calling createBooking function
    await expect(
      bookingService.createBooking(mockData.userId, {
        flightId: mockData.flightId,
        noOfSeats: mockData.noOfSeats,
        passengers: mockData.passengers,
      }),
    ).rejects.toThrow();

    expect(getFlightSpy).toHaveBeenCalledWith(mockData.flightId);
    expect(decrementSeatSpy).toHaveBeenCalledWith(
      mockData.flightId,
      mockData.noOfSeats,
    );
    expect(createBookingSpy).toHaveBeenCalledWith(
      {
        userId: mockData.userId,
        flightId: mockData.flightId,
        noOfSeats: mockData.noOfSeats,
        totalCost: mockData.noOfSeats * mockData.price,
        status: "INITIATED",
      },
      mockData.passengers,
    );
    expect(incrementSeatSpy).toHaveBeenCalledWith(
      mockData.flightId,
      mockData.noOfSeats,
    );
  });
});
