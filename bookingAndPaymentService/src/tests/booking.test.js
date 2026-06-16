const { BookingRepository } = require("../repositories/index");
const flightClient = require("../utils/flightService.client");
const paymentService = require("../services/payment.service.js");
const bookingService = require("../services/booking.service.js");
const eventPublisher = require("../utils/eventPublisher");

describe("testing create booking one way trip function of booking service", () => {
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
        flightNo: "FL-123",
        departureTime: "2026-06-20T10:00:00Z",
        arrivalTime: "2026-06-20T12:00:00Z",
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
        outboundFlightId: mockData.flightId,
        flightSnapshot: {
          outbound: {
            flightId: mockData.flightId,
            flightNo: "FL-123",
            departureTime: "2026-06-20T10:00:00Z",
            arrivalTime: "2026-06-20T12:00:00Z",
            price: mockData.price,
          },
          return: null,
        },
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
        flightNo: "FL-123",
        departureTime: "2026-06-20T10:00:00Z",
        arrivalTime: "2026-06-20T12:00:00Z",
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
        outboundFlightId: mockData.flightId,
        flightSnapshot: {
          outbound: {
            flightId: mockData.flightId,
            flightNo: "FL-123",
            departureTime: "2026-06-20T10:00:00Z",
            arrivalTime: "2026-06-20T12:00:00Z",
            price: mockData.price,
          },
          return: null,
        },
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

describe("testing cancelBooking function of booking service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockBooking = {
    id: 1,
    userId: 1,
    flightId: 1,
    noOfSeats: 2,
    status: "INITIATED",
    flightSnapshot: {
      outbound: { flightId: 1 },
      return: null,
    },
    save: jest.fn().mockResolvedValue(),
  };

  // HAPPY PATH
  it("should cancel booking, release seats, and publish event", async () => {
    const findSpy = jest
      .spyOn(BookingRepository.prototype, "findByIdWithDetails")
      .mockResolvedValue({ ...mockBooking, save: jest.fn().mockResolvedValue() });

    const incrementSpy = jest
      .spyOn(flightClient, "incrementSeats")
      .mockResolvedValue();

    const publishSpy = jest
      .spyOn(eventPublisher, "publish")
      .mockImplementation();

    const result = await bookingService.cancelBooking(mockBooking.id, mockBooking.userId);

    expect(result.status).toBe("CANCELLED");
    expect(result.save).toHaveBeenCalled();
    expect(incrementSpy).toHaveBeenCalledWith(mockBooking.flightId, mockBooking.noOfSeats);
    expect(publishSpy).toHaveBeenCalledWith("booking.cancelled", {
      bookingId: mockBooking.id,
      userId: mockBooking.userId,
      noOfSeats: mockBooking.noOfSeats,
    });
  });

  // ERROR PATHS
  // booking not found
  it("should throw 'Booking not found' if booking does not exist", async () => {
    jest
      .spyOn(BookingRepository.prototype, "findByIdWithDetails")
      .mockResolvedValue(null);

    await expect(
      bookingService.cancelBooking(999, mockBooking.userId),
    ).rejects.toThrow("Booking not found");
  });

  // wrong user
  it("should throw 403 if user does not own the booking", async () => {
    jest
      .spyOn(BookingRepository.prototype, "findByIdWithDetails")
      .mockResolvedValue({ ...mockBooking });

    await expect(
      bookingService.cancelBooking(mockBooking.id, 999),
    ).rejects.toThrow("You are not authorized to cancel this booking");
  });

  // invalid status
  it("should throw error if booking status is CONFIRMED", async () => {
    jest
      .spyOn(BookingRepository.prototype, "findByIdWithDetails")
      .mockResolvedValue({ ...mockBooking, status: "CONFIRMED" });

    await expect(
      bookingService.cancelBooking(mockBooking.id, mockBooking.userId),
    ).rejects.toThrow("Cannot cancel a booking with status: CONFIRMED");

    const incrementSpy = jest.spyOn(flightClient, "incrementSeats");
    expect(incrementSpy).not.toHaveBeenCalled();
  });
});
