onMailerSend((e) => {
  // Match this to where you're running the application
  const url = "http://localhost:3000/api/auth/mail";
  const apiKey = "match the API key in your .env file";
  const subject = e.message.subject;

  if (subject.includes("otp")) {
    const otp = e.message.html.match(/<otp>([^<]+)<\/otp>/)?.[1];
    $http.send({
      url,
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({ email: e.message.to[0].address, subject, otp }),
    });
    return;
  }

  if (subject.includes("password_reset")) {
    const token = e.message.html.match(/<token>([^<]+)<\/token>/)?.[1];
    $http.send({
      url,
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({ email: e.message.to[0].address, subject, token }),
    });
    return;
  }

  e.next();
});
