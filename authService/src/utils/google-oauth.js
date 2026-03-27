const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} = require("../config/serverConfig");
const crypto = require("crypto");
const { AppError } = require("shared");

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";


function getGoogleAuthURL() {
  const state = crypto.randomBytes(16).toString("hex"); 

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "consent",
  });

  return {url : `${GOOGLE_AUTH_URL}?${params.toString()}`, state};
}

async function getGoogleTokens(code) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new AppError("Google token exchange failed", 500);
  }
  return data; 
}


async function getGoogleUserInfo(accessToken) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await response.json();
  if (data.error) {
   throw new AppError("Failed to fetch Google user info", 500);;
  }
  return data; 
}

module.exports = { getGoogleAuthURL, getGoogleTokens, getGoogleUserInfo };
