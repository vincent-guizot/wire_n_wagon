'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      receipt_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      courierId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      supervisorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      managerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      vehicleId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Vehicles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      origin: {
        type: Sequelize.STRING,
        allowNull: false
      },
      destination: {
        type: Sequelize.STRING,
        allowNull: false
      },
      route_type: {
        type: Sequelize.ENUM('in_city', 'inter_city'),
        allowNull: false
      },
      item_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      weight_kg: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      is_paid: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_courier_acc: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      courier_proof_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_client_acc: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      client_proof_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_supervisor_acc: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_manager_final_acc: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      status: {
        type: Sequelize.ENUM(
          'Pending',
          'Payment_Verified',
          'Vehicle_Assigned',
          'On_Delivery',
          'Waiting_Verification',
          'Verified',
          'Completed',
          'Cancelled'
        ),
        allowNull: false,
        defaultValue: 'Pending'
      },
      issue_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};
