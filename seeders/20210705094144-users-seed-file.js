'use strict';
const bcrypt = require('bcryptjs')
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      id: 1,
      email: 'ryan@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: 'Ryan',
      account: 'RyanHuang',
      intro: faker.lorem.text(),
      avatar: 1,
      cover: 2,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 2,
      email: 'lyvia@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: 'Lyvia',
      account: 'LyviaLee',
      intro: faker.lorem.text(),
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 3,
      email: 'aaron@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: 'Aaron',
      account: 'AaronWang',
      intro: faker.lorem.text(),
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 4,
      email: 'betrice@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: 'Beatrice',
      account: 'BeatricePai',
      intro: faker.lorem.text(),


      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 5,
      email: 'tim@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: 'Tim',
      account: 'TimChien',
      intro: faker.lorem.text(),

      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 6,
      email: 'root@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: 'root',
      account: 'root',
      intro: faker.lorem.text(),
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {})
  }
};
