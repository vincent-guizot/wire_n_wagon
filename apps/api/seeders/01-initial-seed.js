'use strict';
const { hashPassword } = require('../helpers/bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const password = hashPassword('password123');
    const now = new Date();

    const users = [
      {
        username: 'client1',
        email: 'client1@wirewagon.com',
        password: password,
        role: 'client',
        createdAt: now,
        updatedAt: now
      },
      {
        username: 'courier1',
        email: 'courier1@wirewagon.com',
        password: password,
        role: 'courier',
        createdAt: now,
        updatedAt: now
      },
      {
        username: 'admin1',
        email: 'admin1@wirewagon.com',
        password: password,
        role: 'admin',
        createdAt: now,
        updatedAt: now
      },
      {
        username: 'supervisor1',
        email: 'supervisor1@wirewagon.com',
        password: password,
        role: 'supervisor',
        createdAt: now,
        updatedAt: now
      },
      {
        username: 'manager1',
        email: 'manager1@wirewagon.com',
        password: password,
        role: 'manager',
        createdAt: now,
        updatedAt: now
      },
      {
        username: 'owner1',
        email: 'owner1@wirewagon.com',
        password: password,
        role: 'owner',
        createdAt: now,
        updatedAt: now
      }
    ];

    await queryInterface.bulkInsert('Users', users, {});

    const vehicles = [
      {
        name: 'Bicycle Messenger (Sepeda Onthel)',
        type: 'In-City',
        capacity_kg: 15,
        cost_per_km: 5,
        is_available: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Horse-Drawn Cart (Gerobak Kuda)',
        type: 'In-City',
        capacity_kg: 300,
        cost_per_km: 20,
        is_available: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Steam Wagon (Truk Uap)',
        type: 'In-City / Short Inter-City',
        capacity_kg: 2000,
        cost_per_km: 50,
        is_available: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Steam Locomotive (Lokomotif Uap)',
        type: 'Inter-City',
        capacity_kg: 50000,
        cost_per_km: 150,
        is_available: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Steamboat (Kapal Uap Sungai)',
        type: 'River / Inter-City',
        capacity_kg: 20000,
        cost_per_km: 100,
        is_available: true,
        createdAt: now,
        updatedAt: now
      }
    ];

    await queryInterface.bulkInsert('Vehicles', vehicles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Vehicles', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
