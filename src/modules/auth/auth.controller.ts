import { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import { AuthServices } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../utils/AppError";
import config from "../../config";

const getGoogleOAuthClient = () => {
  return new OAuth2Client(
    config.google.clientId,
    config.google.clientSecret,
    config.google.callbackUrl
  );
};

const getCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    config.nodeEnv === "production" ||
    Boolean(process.env.BACKEND_URL && !process.env.BACKEND_URL.includes("localhost"));

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("lax" as const) : ("lax" as const),
    path: "/",
  };
};

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerUser(req.body);

  sendResponse(res, {
    statusCode: 201,
    message: "User registered successfully!",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);
  const cookieOptions = getCookieOptions();

  res.cookie("accessToken", result.accessToken, cookieOptions);
  res.cookie("refreshToken", result.refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    message: "User logged in successfully!",
    data: result.user,
  });
});

const googleAuth = catchAsync(async (req: Request, res: Response) => {
  const oauth2Client = getGoogleOAuthClient();
  const redirectTarget = typeof req.query.redirect === "string" ? req.query.redirect : "/";

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "select_account",
    state: redirectTarget,
  });

  res.redirect(authorizationUrl);
});

const getFrontendUrl = (req: Request) => {
  const host = req.get("host") || "";
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return "http://localhost:3000";
  }

  const isProduction =
    process.env.NODE_ENV === "production" ||
    config.nodeEnv === "production" ||
    Boolean(process.env.BACKEND_URL && !process.env.BACKEND_URL.includes("localhost"));

  if (isProduction && config.frontendUrl) {
    return config.frontendUrl.replace(/\/$/, "");
  }

  return (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
};

const googleCallback = catchAsync(async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  const error = req.query.error as string | undefined;
  const state =
    typeof req.query.state === "string" && req.query.state.startsWith("/")
      ? req.query.state
      : "/";
  const frontendUrl = getFrontendUrl(req);

  if (error || !code) {
    return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
  }

  try {
    const oauth2Client = getGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (!tokens.id_token) {
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || payload.given_name || email.split("@")[0];
    const avatar = payload.picture || null;

    const result = await AuthServices.handleGoogleLogin({
      googleId,
      email,
      name,
      avatar,
    });

    const cookieOptions = getCookieOptions();
    res.cookie("accessToken", result.accessToken, cookieOptions);
    res.cookie("refreshToken", result.refreshToken, cookieOptions);

    const redirectPath = state && state !== "/" ? state : "";
    return res.redirect(
      `${frontendUrl}${redirectPath ? (redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`) : "/"}`
    );
  } catch (err: any) {
    if (err instanceof AppError && err.statusCode === 403) {
      return res.redirect(`${frontendUrl}/login?error=account_banned`);
    }
    return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
  }
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.getMe(req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    message: "User profile retrieved successfully!",
    data: result,
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  const cookieOptions = getCookieOptions();

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    message: "User logged out successfully!",
    data: null,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token =
    req.cookies?.refreshToken ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : req.headers.authorization);

  if (!token) {
    throw new AppError(401, "Refresh token is missing!");
  }

  const result = await AuthServices.refreshToken(token);
  const cookieOptions = getCookieOptions();

  res.cookie("accessToken", result.accessToken, cookieOptions);
  res.cookie("refreshToken", result.refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    message: "Access token refreshed successfully!",
    data: {
      refreshed: true,
    },
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.updateProfile(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    message: "Profile updated successfully!",
    data: result,
  });
});

const deleteProfile = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.deleteProfile(req.user!.id);
  const cookieOptions = getCookieOptions();

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    message: "User account deleted successfully!",
    data: null,
  });
});

export const AuthControllers = {
  registerUser,
  loginUser,
  googleAuth,
  googleCallback,
  getMe,
  logout,
  refreshToken,
  updateProfile,
  deleteProfile,
};
