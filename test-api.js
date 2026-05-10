const url = 'http://localhost:3000/graphql';

async function fetchGraphQL(query, variables = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();
  if (data.errors) {
    console.error('GraphQL Error:', JSON.stringify(data.errors, null, 2));
    throw new Error(data.errors[0].message);
  }
  return data.data;
}

async function runTests() {
  console.log('--- Starting API Tests ---');

  try {
    // 1. Register Admin
    console.log('\\n1. Register Admin');
    const registerAdminQuery = `
      mutation {
        register(registerInput: {
          name: "Admin User",
          email: "admin@example.com",
          password: "password123",
          role: ADMIN
        }) {
          accessToken
          user {
            id
            name
            role
          }
        }
      }
    `;
    let adminToken = '';
    try {
      const adminRes = await fetchGraphQL(registerAdminQuery);
      adminToken = adminRes.register.accessToken;
      console.log('Admin Registered:', adminRes.register.user.email);
    } catch (e) {
      // If already registered, login
      console.log('Admin probably already registered. Trying to login...');
      const loginAdminQuery = `
        mutation {
          login(loginInput: {
            email: "admin@example.com",
            password: "password123"
          }) {
            accessToken
            user {
              id
            }
          }
        }
      `;
      const loginRes = await fetchGraphQL(loginAdminQuery);
      adminToken = loginRes.login.accessToken;
    }
    console.log('Admin Token acquired.');

    // 2. Register Student
    console.log('\\n2. Register Student');
    const registerStudentQuery = `
      mutation {
        register(registerInput: {
          name: "Student User",
          email: "student@example.com",
          password: "password123",
          role: STUDENT
        }) {
          accessToken
          user {
            id
            name
            role
          }
        }
      }
    `;
    let studentToken = '';
    let studentId = '';
    try {
      const studentRes = await fetchGraphQL(registerStudentQuery);
      studentToken = studentRes.register.accessToken;
      studentId = studentRes.register.user.id;
      console.log('Student Registered:', studentRes.register.user.email);
    } catch (e) {
      // If already registered, login
      console.log('Student probably already registered. Trying to login...');
      const loginStudentQuery = `
        mutation {
          login(loginInput: {
            email: "student@example.com",
            password: "password123"
          }) {
            accessToken
            user {
              id
            }
          }
        }
      `;
      const loginRes = await fetchGraphQL(loginStudentQuery);
      studentToken = loginRes.login.accessToken;
      studentId = loginRes.login.user.id;
    }
    console.log('Student Token acquired.');

    // 3. Create Center (Admin)
    console.log('\\n3. Create Center');
    const createCenterQuery = `
      mutation {
        createCenter(createCenterInput: {
          name: "Main Branch",
          location: "Dhaka",
          openingTime: "08:00",
          closingTime: "22:00"
        }) {
          id
          name
        }
      }
    `;
    const centerRes = await fetchGraphQL(createCenterQuery, {}, adminToken);
    const centerId = centerRes.createCenter.id;
    console.log('Center Created with ID:', centerId);

    // 4. Create Seat (Admin)
    console.log('\\n4. Create Seat');
    const createSeatQuery = `
      mutation($centerId: String!) {
        createSeat(createSeatInput: {
          seatNumber: "A1",
          centerId: $centerId,
          type: "regular",
          pricePerHour: 50,
          pricePerMonth: 5000,
          isActive: true
        }) {
          id
          seatNumber
        }
      }
    `;
    const seatRes = await fetchGraphQL(createSeatQuery, { centerId }, adminToken);
    const seatId = seatRes.createSeat.id;
    console.log('Seat Created with ID:', seatId);

    // 5. Create Book (Admin)
    console.log('\\n5. Create Book');
    const createBookQuery = `
      mutation($centerId: String!) {
        createBook(createBookInput: {
          title: "Learn NestJS",
          author: "John Doe",
          price: 200,
          stock: 10,
          type: "sell",
          centerId: $centerId
        }) {
          id
          title
        }
      }
    `;
    const bookRes = await fetchGraphQL(createBookQuery, { centerId }, adminToken);
    const bookId = bookRes.createBook.id;
    console.log('Book Created with ID:', bookId);

    // 6. Buy Book (Student)
    console.log('\\n6. Buy Book');
    const buyBookQuery = `
      mutation($bookId: String!) {
        buyBook(createOrderInput: {
          bookId: $bookId,
          quantity: 2
        }) {
          id
          status
        }
      }
    `;
    const buyRes = await fetchGraphQL(buyBookQuery, { bookId }, studentToken);
    console.log('Book Bought, Order ID:', buyRes.buyBook.id);

    // 7. Get Available Seats (Public)
    console.log('\\n7. Get Available Seats');
    const availableSeatsQuery = `
      query($centerId: String!) {
        availableSeats(
          centerId: $centerId,
          startTime: "2026-06-01T10:00:00.000Z",
          endTime: "2026-06-01T12:00:00.000Z"
        ) {
          id
          seatNumber
        }
      }
    `;
    const availRes = await fetchGraphQL(availableSeatsQuery, { centerId });
    console.log('Available Seats:', availRes.availableSeats.length);

    // 8. Book Seat (Student)
    console.log('\\n8. Book Seat');
    const bookSeatQuery = `
      mutation($centerId: String!, $seatId: String!) {
        createBooking(createBookingInput: {
          seatId: $seatId,
          centerId: $centerId,
          startTime: "2026-06-01T10:00:00.000Z",
          endTime: "2026-06-01T12:00:00.000Z",
          bookingType: "hourly"
        }) {
          id
          status
        }
      }
    `;
    const bookingRes = await fetchGraphQL(bookSeatQuery, { centerId, seatId }, studentToken);
    const bookingId = bookingRes.createBooking.id;
    console.log('Seat Booked, Booking ID:', bookingId);

    // 9. Init Payment (Student)
    console.log('\\n9. Init Payment');
    const initPaymentQuery = `
      mutation($bookingId: String!) {
        initPayment(bookingId: $bookingId) {
          paymentUrl
        }
      }
    `;
    const paymentRes = await fetchGraphQL(initPaymentQuery, { bookingId }, studentToken);
    console.log('Payment URL:', paymentRes.initPayment.paymentUrl);

    console.log('\\n--- All Tests Passed Successfully! ---');
  } catch (error) {
    console.error('\\n--- Test Failed ---', error);
  }
}

runTests();
