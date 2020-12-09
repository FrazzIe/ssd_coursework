# Bug Tracker

A support ticket system for tracking bugs built with [Nuxt.js](https://nuxtjs.org).

## Features

* Password hashing (argon2)
* Login/Registration
* Create, View & List Tickets
* Single Page Application
* Permission system
* Protected routes

## Requirements

* A functioning MySQL database (MariaDB - https://mariadb.com/downloads/) or use XAMPP (https://www.apachefriends.org/index.html) for hosting locally
* Yarn package manager (https://classic.yarnpkg.com/en/docs/getting-started)

## Setup

```bash
# Clone repository
$ git clone https://github.com/FrazzIe/ssd_coursework.git
$ cd ssd_coursework

# Install dependencies
$ yarn install
```

### Database credentials & application secrets

1. Create a file called `.env`
2. Paste the content below inside and enter your credentials

```
# Database credentails
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASS=
MYSQL_DB=bug_tracker
# Authentication secret
JWT_SECRET=secret
```

- Above are all the applications specific environment variables, you can set them yourself or let the application handle them in the `.env` file.

### Importing the database schema

- Run the `schema.sql` script included in the repository in your database system

### Building and running the application

```bash
# build for production and launch server
$ yarn build
$ yarn start
```

### Included accounts for demonstration purposes (remove from database if used for non-demo purposes)

| Username           | Password            | Group     |
|--------------------|---------------------|-----------|
| User123            | User123@            | user      |
| Client123          | Client123@          | client    |
| Tester123          | Tester123@          | tester    |
| Developer123       | Developer123@       | developer |
| Admin123           | Admin123            | admin     |