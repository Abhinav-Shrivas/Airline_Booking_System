"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM "Airports" LIMIT 1`,
    );
    if (existing.length > 0) return;

    await queryInterface.bulkInsert(
      "Airports",
      [
        {
          name: "Indira Gandhi International Airport",
          address: "IGI Airport, Palam, New Delhi",
          city_id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Chhatrapati Shivaji Maharaj International Airport",
          address: "Sahar, Mumbai",
          city_id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Kempegowda International Airport",
          address: "Devanahalli, Bengaluru",
          city_id: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Chennai International Airport",
          address: "Meenambakkam, Chennai",
          city_id: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Rajiv Gandhi International Airport",
          address: "Shamshabad, Hyderabad",
          city_id: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Netaji Subhas Chandra Bose International Airport",
          address: "Dumdum, Kolkata",
          city_id: 6,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Pune Airport",
          address: "Lohegaon, Pune",
          city_id: 7,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Sardar Vallabhbhai Patel International Airport",
          address: "Hansol, Ahmedabad",
          city_id: 8,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Jaipur International Airport",
          address: "Sanganeer, Jaipur",
          city_id: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Chaudhary Charan Singh International Airport",
          address: "Amausi, Lucknow",
          city_id: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Shaheed Bhagat Singh Airport",
          address: "Chandigarh Airport, Chandigarh",
          city_id: 11,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Devi Ahilya Bai Holkar Airport",
          address: "Airport Road, Indore",
          city_id: 12,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Raja Bhoj Airport",
          address: "Bhopal Airport, Bhopal",
          city_id: 13,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Dr. Babasaheb Ambedkar International Airport",
          address: "Sonegaon, Nagpur",
          city_id: 14,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Surat Airport",
          address: "Magdalla, Surat",
          city_id: 15,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Jay Prakash Narayan Airport",
          address: "Patna City, Patna",
          city_id: 16,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Coimbatore International Airport",
          address: "Peelamedu, Coimbatore",
          city_id: 17,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Visakhapatnam Airport",
          address: "Bheemunipatnam, Visakhapatnam",
          city_id: 18,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Vadodara Airport",
          address: "Harni, Vadodara",
          city_id: 19,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Birsa Munda Airport",
          address: "Ranchi Airport, Ranchi",
          city_id: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Extra Delhi airports (city_id: 1)
        {
          name: "Delhi Safdarjung Airport",
          address: "Safdarjung, New Delhi",
          city_id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Delhi Hindon Airport",
          address: "Ghaziabad, Delhi NCR",
          city_id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Delhi Jewar International Airport",
          address: "Jewar, Greater Noida",
          city_id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Extra Mumbai airports (city_id: 2)
        {
          name: "Navi Mumbai International Airport",
          address: "Panvel, Navi Mumbai",
          city_id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Mumbai Juhu Aerodrome",
          address: "Juhu, Mumbai",
          city_id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Mumbai Thane Airfield",
          address: "Thane, Mumbai",
          city_id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Airports", null, {});
  },
};
