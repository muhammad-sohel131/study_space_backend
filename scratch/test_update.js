const fetch = require('node-fetch');

async function testUpdate() {
  const query = `
    query {
      centers {
        id
        name
      }
    }
  `;

  // First get a center
  const getRes = await fetch('http://localhost:5000/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  const getData = await getRes.json();
  const centers = getData.data?.centers;
  if (!centers || centers.length === 0) {
    console.log("No centers found to update.");
    return;
  }
  
  const centerToUpdate = centers[0];
  console.log("Original center:", centerToUpdate);

  // Authenticate to get token
  const loginQuery = `
    mutation {
      login(loginInput: { email: "admin@studyspace.com", password: "password123" }) {
        accessToken
      }
    }
  `;
  // Wait, I don't know the exact admin password, but I can bypass auth for the test if I want, or just check the token.
  // Actually, I can just write a script that connects to MongoDB and tests the CentersService update directly!
}

testUpdate();
