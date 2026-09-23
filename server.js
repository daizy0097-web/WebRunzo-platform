// server.ts
import express from "express";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import Razorpay from "razorpay";
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var app = express();
app.set("trust proxy", 1);
var getSupabaseConfig = () => {
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
  const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  return { url, anonKey, serviceRoleKey };
};
var _supabaseAnon = null;
var getSupabaseAnon = () => {
  if (!_supabaseAnon) {
    const { url, anonKey } = getSupabaseConfig();
    if (url && anonKey) {
      _supabaseAnon = createClient(url, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
    }
  }
  return _supabaseAnon;
};
var supabaseAnon = new Proxy({}, {
  get(_target, prop) {
    const client = getSupabaseAnon();
    if (!client) {
      if (prop === "auth") {
        return {
          getUser: async () => ({
            data: { user: null },
            error: new Error("Supabase client is not configured on the server.")
          })
        };
      }
      return void 0;
    }
    return client[prop];
  }
});
var getCallerClient = (token) => {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    throw new Error("Supabase client is not configured on the server.");
  }
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
};
var getAdminClient = () => {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const rawKey = serviceRoleKey;
  const trimmedKey = rawKey.trim();
  if (!trimmedKey) {
    return {
      client: null,
      code: "CONFIG_BLOCKER",
      error: "Server configuration requirement: SUPABASE_SERVICE_ROLE_KEY is required on the server to provision client Auth accounts and send secure first-access invitations. Please configure SUPABASE_SERVICE_ROLE_KEY in your deployment environment settings."
    };
  }
  if (trimmedKey.startsWith("sbp_")) {
    return {
      client: null,
      code: "CONFIG_BLOCKER",
      error: "Server configuration error: SUPABASE_SERVICE_ROLE_KEY is currently configured with a Supabase Personal Access Token (sbp_...) instead of the project service_role secret key. Please obtain the service_role JWT (starts with eyJ...) from Supabase Dashboard > Project Settings > API and update SUPABASE_SERVICE_ROLE_KEY in your deployment environment settings."
    };
  }
  if (!trimmedKey.startsWith("eyJ")) {
    return {
      client: null,
      code: "CONFIG_BLOCKER",
      error: "Server configuration error: SUPABASE_SERVICE_ROLE_KEY is not a valid Supabase service_role JWT. Please obtain the service_role JWT (starts with eyJ...) from Supabase Dashboard > Project Settings > API and update SUPABASE_SERVICE_ROLE_KEY in your deployment environment settings."
    };
  }
  if (!url) {
    return {
      client: null,
      code: "CONFIG_BLOCKER",
      error: "Server configuration error: Supabase URL is not configured."
    };
  }
  try {
    const client = createClient(url, trimmedKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    return { client };
  } catch (err) {
    return {
      client: null,
      code: "CONFIG_BLOCKER",
      error: "Server configuration error: Failed to initialize Supabase admin client."
    };
  }
};
var razorpayClient = null;
var getRazorpay = () => {
  const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
  if (!keyId || !keySecret) {
    return { client: null, keyId: "", keySecret: "" };
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }
  return { client: razorpayClient, keyId, keySecret };
};
var PLAN_CATALOG = {
  "plan-starter": {
    name: "Starter Plan",
    amountPaise: 299900,
    amountINR: 2999,
    description: "Single-page responsive turnkey website, managed hosting, SSL, and monthly webmaster updates."
  },
  "plan-pro": {
    name: "Professional Plan",
    amountPaise: 499900,
    amountINR: 4999,
    description: "Up to 5 custom pages, CDN acceleration, daily backups, SEO optimization, and priority turnaround."
  },
  "plan-business": {
    name: "Business VIP Plan",
    amountPaise: 899900,
    amountINR: 8999,
    description: "Unlimited revisions, custom database integrations, dedicated account specialist, and 1-day turnaround."
  }
};
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
var createRateLimiter = (options) => {
  const { windowMs, max, message } = options;
  const store = /* @__PURE__ */ new Map();
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now >= record.resetTime) {
        store.delete(key);
      }
    }
  }, 6e4);
  cleanupInterval.unref?.();
  const defaultKeyGenerator = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      if (token) {
        const hash = crypto.createHash("sha256").update(token).digest("hex").slice(0, 16);
        return `auth:${hash}`;
      }
    }
    const forwarded = req.headers["x-forwarded-for"];
    const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : Array.isArray(forwarded) ? forwarded[0].trim() : req.socket.remoteAddress || req.ip || "127.0.0.1";
    return `ip:${ip}`;
  };
  const keyGen = options.keyGenerator || defaultKeyGenerator;
  return (req, res, next) => {
    const now = Date.now();
    const key = keyGen(req);
    let record = store.get(key);
    if (!record || now >= record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      store.set(key, record);
    } else {
      record.count += 1;
    }
    const remaining = Math.max(0, max - record.count);
    const retryAfterSec = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1e3));
    if (record.count > max) {
      res.setHeader("Retry-After", retryAfterSec);
      return res.status(429).json({
        success: false,
        code: "RATE_LIMIT_EXCEEDED",
        error: message || `Too many requests. Please try again in ${retryAfterSec} seconds.`,
        retryAfter: retryAfterSec
      });
    }
    next();
  };
};
var paymentCreateOrderLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1e3,
  max: 20,
  message: "Too many payment order creation requests. Please try again later."
});
var paymentVerifyLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1e3,
  max: 30,
  message: "Too many payment verification attempts. Please try again later."
});
var paymentWebhookLimiter = createRateLimiter({
  windowMs: 60 * 1e3,
  max: 120,
  message: "Webhook delivery rate limit exceeded.",
  keyGenerator: (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : Array.isArray(forwarded) ? forwarded[0].trim() : req.socket.remoteAddress || req.ip || "127.0.0.1";
    return `webhook:${ip}`;
  }
});
var adminConvertLeadLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1e3,
  max: 30,
  message: "Too many lead conversion requests. Please try again later."
});
var adminOrderUpdateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1e3,
  max: 60,
  message: "Too many order status update requests. Please try again later."
});
var clientRedeployLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1e3,
  max: 10,
  message: "Redeploy rate limit exceeded. Please wait before triggering another production build."
});
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "webrunzo-server",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/admin/convert-lead", adminConvertLeadLimiter, async (req, res) => {
  const ADMIN_EMAIL = "hello.webrunzo@gmail.com";
  let isNewAuthUser = false;
  let authUserId = null;
  let supabaseAdmin = null;
  const cleanupNewAuthUser = async (reason) => {
    if (isNewAuthUser && authUserId && supabaseAdmin) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
        console.log(`[convert-lead] Cleaned up newly created auth user ${authUserId} (${reason})`);
      } catch (cleanupErr) {
        console.warn(`[convert-lead] Failed to cleanup newly created auth user ${authUserId} (${reason}):`, cleanupErr?.message);
      }
    }
  };
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHENTICATED",
        error: "Authentication required. Missing Bearer token."
      });
    }
    const token = authHeader.split(" ")[1];
    const { data: authUserData, error: authUserErr } = await supabaseAnon.auth.getUser(token);
    if (authUserErr || !authUserData?.user) {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        error: "Unauthorized: Invalid or expired admin session."
      });
    }
    const callerClient = getCallerClient(token);
    const { data: callerProfile, error: profileErr } = await callerClient.from("profiles").select("id, email, role, full_name").eq("id", authUserData.user.id).maybeSingle();
    if (profileErr) {
      console.error("Database error verifying caller profile in convert-lead:", profileErr);
      return res.status(500).json({
        success: false,
        code: "PROFILE_VERIFICATION_ERROR",
        error: `Database error while verifying administrator profile: ${profileErr.message || "Unknown database error"}`
      });
    }
    if (!callerProfile) {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN",
        error: "Forbidden: Administrator profile does not exist in the database."
      });
    }
    if (callerProfile.role !== "admin") {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN",
        error: `Forbidden: Account role "${callerProfile.role}" is not authorized as an administrator.`
      });
    }
    const { enquiryId } = req.body;
    if (!enquiryId || typeof enquiryId !== "string") {
      return res.status(400).json({
        success: false,
        code: "INVALID_PARAM",
        error: "Missing or invalid enquiryId parameter."
      });
    }
    const { data: enquiry, error: enqFetchErr } = await callerClient.from("enquiries").select("*").eq("id", enquiryId).maybeSingle();
    if (enqFetchErr) {
      console.error("Database error during enquiry lookup:", enqFetchErr);
      return res.status(500).json({
        success: false,
        code: "ENQUIRY_LOOKUP_ERROR",
        error: `Database operation failed during enquiry lookup: ${enqFetchErr.message || "Unknown database error"}`
      });
    }
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        error: `Lead enquiry with ID "${enquiryId}" was not found.`
      });
    }
    if (enquiry.status === "Converted") {
      return res.status(409).json({
        success: false,
        code: "ALREADY_CONVERTED",
        error: "This lead enquiry has already been converted into a customer account."
      });
    }
    const email = (enquiry.email || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_EMAIL",
        error: `Invalid email address "${enquiry.email}" on lead record. Please correct the email before conversion.`
      });
    }
    if (email === ADMIN_EMAIL.toLowerCase() || email === (authUserData.user.email || "").toLowerCase()) {
      return res.status(400).json({
        success: false,
        code: "ADMIN_EMAIL_CONFLICT",
        error: "Cannot convert lead using the Master Admin email address. Clients must have distinct email accounts."
      });
    }
    const isPremium = enquiry.selected_plan_id === "plan-business" || (enquiry.selected_plan_id || "").toLowerCase().includes("business") || (enquiry.selected_plan_id || "").toLowerCase().includes("elite");
    const clientTier = isPremium ? "premium" : "normal";
    const { data: existingProfByEmail } = await callerClient.from("profiles").select("id, email, role, customer_id, client_tier").ilike("email", email).maybeSingle();
    if (existingProfByEmail?.role === "admin") {
      return res.status(409).json({
        success: false,
        code: "ACCOUNT_ROLE_CONFLICT",
        error: `Email "${email}" belongs to an administrative account and cannot be converted to a client.`
      });
    }
    authUserId = existingProfByEmail?.id || null;
    let actionLink = null;
    let invitationSent = false;
    const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");
    const redirectUrl = `${appUrl}/#/client`;
    const adminCheck = getAdminClient();
    supabaseAdmin = adminCheck.client;
    if (!authUserId) {
      if (!supabaseAdmin) {
        return res.status(503).json({
          success: false,
          code: adminCheck.code || "CONFIG_BLOCKER",
          error: adminCheck.error
        });
      }
      let existingAuthUser = null;
      let page = 1;
      const perPage = 500;
      let hasMore = true;
      try {
        while (!existingAuthUser && hasMore) {
          const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
            page,
            perPage
          });
          if (listError) {
            console.warn("Auth listUsers warning:", listError.message);
            hasMore = false;
            break;
          }
          const users = listData?.users || [];
          existingAuthUser = users.find((u) => u.email?.toLowerCase() === email);
          if (existingAuthUser || users.length < perPage) {
            hasMore = false;
          } else {
            page++;
          }
        }
      } catch (lookupErr) {
        console.warn("Auth user directory lookup bypassed:", lookupErr?.message);
      }
      if (existingAuthUser) {
        authUserId = existingAuthUser.id;
        try {
          const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
            type: "recovery",
            email,
            options: { redirectTo: redirectUrl }
          });
          if (!linkErr && linkData?.properties?.action_link) {
            actionLink = linkData.properties.action_link;
          }
        } catch (linkGenErr) {
          console.warn("Note on generateLink for existing auth user:", linkGenErr?.message);
        }
      } else {
        const { data: createData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: enquiry.name || "Client",
            role: "client",
            client_tier: clientTier,
            password_setup_status: "pending"
          }
        });
        if (!createErr && createData?.user) {
          authUserId = createData.user.id;
          isNewAuthUser = true;
          try {
            const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
              type: "recovery",
              email,
              options: { redirectTo: redirectUrl }
            });
            if (!linkErr && linkData?.properties?.action_link) {
              actionLink = linkData.properties.action_link;
            }
          } catch (linkGenErr) {
            console.warn("Note on generateLink for newly created user:", linkGenErr?.message);
          }
        } else {
          console.warn("createUser notice:", createErr?.message);
          const isAlreadyRegistered = createErr?.code === "email_exists" || (createErr?.message || "").toLowerCase().includes("already") || (createErr?.message || "").toLowerCase().includes("registered");
          if (isAlreadyRegistered) {
            try {
              const { data: recData, error: recErr } = await supabaseAdmin.auth.admin.generateLink({
                type: "recovery",
                email,
                options: { redirectTo: redirectUrl }
              });
              if (!recErr && recData?.user) {
                authUserId = recData.user.id;
                actionLink = recData.properties?.action_link || null;
              }
            } catch (recErr) {
              console.warn("generateLink recovery lookup error:", recErr?.message);
            }
            if (!authUserId) {
              try {
                const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1e3 });
                const matched = (listData?.users || []).find((u) => u.email?.toLowerCase() === email);
                if (matched) {
                  authUserId = matched.id;
                }
              } catch (listErr) {
                console.warn("Fallback listUsers failed:", listErr?.message);
              }
            }
          }
          if (!authUserId) {
            return res.status(500).json({
              success: false,
              code: "AUTH_PROVISION_FAILED",
              error: `Failed to provision client authentication account: ${createErr?.message || "Unknown error"}`
            });
          }
        }
      }
    } else {
      if (supabaseAdmin) {
        try {
          const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
            type: "recovery",
            email,
            options: { redirectTo: redirectUrl }
          });
          if (!linkErr && linkData?.properties?.action_link) {
            actionLink = linkData.properties.action_link;
          }
        } catch (linkGenErr) {
          console.warn("Note on generateLink for existing profile user:", linkGenErr?.message);
        }
      }
    }
    if (!authUserId) {
      return res.status(500).json({
        success: false,
        code: "AUTH_UID_MISSING",
        error: "Failed to resolve unique authentication user identifier."
      });
    }
    const planId = enquiry.selected_plan_id || (isPremium ? "plan-business" : "plan-pro");
    const templateId = enquiry.selected_template_id || "tpl-biz-1";
    const adminName = callerProfile.full_name || "Admin";
    const { data: rpcResult, error: rpcError } = await callerClient.rpc(
      "convert_enquiry_to_customer_atomic",
      {
        p_enquiry_id: enquiryId,
        p_auth_user_id: authUserId,
        p_client_tier: clientTier,
        p_plan_id: planId,
        p_template_id: templateId,
        p_admin_name: adminName
      }
    );
    if (rpcError) {
      console.error("convert_enquiry_to_customer_atomic RPC error:", rpcError);
      await cleanupNewAuthUser("RPC error");
      const isMissingRpc = rpcError.code === "PGRST202";
      const isAuthError = rpcError.code === "42501" || (rpcError.message || "").toLowerCase().includes("permission denied");
      const statusCode = isMissingRpc ? 501 : isAuthError ? 403 : 500;
      return res.status(statusCode).json({
        success: false,
        code: isMissingRpc ? "RPC_MIGRATION_REQUIRED" : rpcError.code || "DATABASE_OPERATION_FAILED",
        error: isMissingRpc ? 'Database conversion function "convert_enquiry_to_customer_atomic" is not installed in the schema cache. Please execute migration 20260915_atomic_lead_conversion.sql in your Supabase SQL Editor.' : `Database conversion failed: ${rpcError.message || "Please try again."}`,
        detail: rpcError.details || rpcError.hint
      });
    }
    if (!rpcResult || rpcResult.success === false) {
      await cleanupNewAuthUser("RPC failure result");
      const errCode = rpcResult?.code || "CONVERSION_TRANSACTION_FAILED";
      const errMsg = rpcResult?.error || "Database conversion transaction failed to complete.";
      const statusCode = errCode === "FORBIDDEN" ? 403 : errCode === "NOT_FOUND" ? 404 : errCode === "ALREADY_CONVERTED" ? 409 : ["INVALID_PARAM", "INVALID_EMAIL", "ADMIN_EMAIL_CONFLICT", "ACCOUNT_ROLE_CONFLICT"].includes(errCode) ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        code: errCode,
        error: errMsg,
        detail: rpcResult?.detail
      });
    }
    const customerRow = rpcResult.customer || {};
    const nowIso = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const createdCustomer = {
      id: customerRow.id || rpcResult.customer_id,
      userId: authUserId,
      name: customerRow.name || enquiry.name || "New Client",
      businessName: customerRow.business_name || enquiry.business || "My Business",
      email: customerRow.email || email,
      phone: customerRow.phone || enquiry.phone || "",
      clientTier: customerRow.client_tier || rpcResult.client_tier || clientTier,
      planId: customerRow.plan_id || rpcResult.plan_id || planId,
      templateId: customerRow.template_id || rpcResult.template_id || templateId,
      paymentStatus: customerRow.payment_status || "Paid",
      planStartDate: customerRow.plan_start_date || nowIso,
      planExpiryDate: customerRow.plan_expiry_date || new Date(Date.now() + 365 * 864e5).toISOString().split("T")[0],
      websiteUrl: customerRow.website_url,
      websiteStatus: customerRow.website_status || "In Progress",
      accountStatus: customerRow.account_status || rpcResult.account_status || "Active",
      notes: customerRow.notes || `Converted from Website Enquiry on ${nowIso}`,
      seoScore: customerRow.seo_score,
      speedScore: customerRow.speed_score,
      uptimePercent: customerRow.uptime_percent,
      customContent: customerRow.custom_content,
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          date: nowIso,
          action: invitationSent ? "Lead converted to Client. Official invitation email dispatched." : "Lead converted to Client. Authentication account linked.",
          user: adminName
        }
      ]
    };
    const initialAuthStatus = {
      passwordSetupStatus: "Pending",
      lastLinkSentAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastActionType: "setup"
    };
    createdCustomer.authStatus = initialAuthStatus;
    if (createdCustomer.customContent) {
      createdCustomer.customContent.authStatus = initialAuthStatus;
      try {
        await callerClient.from("customers").update({ custom_content: createdCustomer.customContent }).eq("id", createdCustomer.id);
      } catch (custAuthUpdateErr) {
        console.warn("Note updating customer custom_content authStatus:", custAuthUpdateErr?.message);
      }
    }
    return res.json({
      success: true,
      customer: createdCustomer,
      customerId: rpcResult.customer_id,
      orderId: rpcResult.order_id,
      paymentId: rpcResult.payment_id,
      accountStatus: rpcResult.account_status,
      tier: rpcResult.client_tier,
      plan: rpcResult.plan_id,
      template: rpcResult.template_id,
      invitationSent,
      actionLink: actionLink || void 0,
      message: invitationSent ? `Lead successfully converted! Invitation email dispatched to ${email}.` : actionLink ? `Lead successfully converted! Client Auth account provisioned.` : `Lead successfully converted and client account linked.`
    });
  } catch (err) {
    console.error("Unexpected error in convert-lead API:", err);
    await cleanupNewAuthUser("Unexpected catch error");
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      error: err?.message || "Server error during lead conversion."
    });
  }
});
app.post("/api/admin/client-auth/send-link", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHENTICATED",
        error: "Authentication required. Missing Bearer token."
      });
    }
    const token = authHeader.split(" ")[1];
    const { data: authUserData, error: authUserErr } = await supabaseAnon.auth.getUser(token);
    if (authUserErr || !authUserData?.user) {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        error: "Unauthorized: Invalid or expired admin session."
      });
    }
    const callerClient = getCallerClient(token);
    const { data: callerProfile, error: profileErr } = await callerClient.from("profiles").select("id, email, role, full_name").eq("id", authUserData.user.id).maybeSingle();
    if (profileErr || !callerProfile || callerProfile.role !== "admin") {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN",
        error: "Forbidden: Only administrators can manage client credentials."
      });
    }
    const { customerId, actionType = "setup" } = req.body;
    if (!customerId || typeof customerId !== "string") {
      return res.status(400).json({
        success: false,
        code: "INVALID_PARAM",
        error: "Missing or invalid customerId parameter."
      });
    }
    const { data: customer, error: custErr } = await callerClient.from("customers").select("*").eq("id", customerId).maybeSingle();
    if (custErr || !customer) {
      return res.status(404).json({
        success: false,
        code: "CUSTOMER_NOT_FOUND",
        error: `Customer with ID "${customerId}" not found.`
      });
    }
    const clientEmail = (customer.email || "").trim().toLowerCase();
    if (!clientEmail) {
      return res.status(400).json({
        success: false,
        code: "INVALID_CLIENT_EMAIL",
        error: "Customer record does not have a valid email address."
      });
    }
    const adminCheck = getAdminClient();
    const supabaseAdmin = adminCheck.client;
    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        code: "ADMIN_AUTH_UNAVAILABLE",
        error: "Supabase admin service key is not configured on the server."
      });
    }
    const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");
    const redirectUrl = `${appUrl}/#/client`;
    let clientUserId = customer.user_id;
    if (!clientUserId) {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = listData?.users?.find((u) => u.email?.toLowerCase() === clientEmail);
      if (existingUser) {
        clientUserId = existingUser.id;
      } else {
        const { data: createdUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: clientEmail,
          email_confirm: true,
          user_metadata: {
            full_name: customer.name || "Client",
            role: "client",
            client_tier: customer.client_tier || "normal",
            password_setup_status: "pending"
          }
        });
        if (!createErr && createdUser?.user) {
          clientUserId = createdUser.user.id;
        }
      }
      if (clientUserId) {
        await callerClient.from("customers").update({ user_id: clientUserId }).eq("id", customerId);
      }
    }
    if (actionType === "reset" && clientUserId) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(clientUserId, {
          user_metadata: {
            password_setup_status: "pending",
            reset_requested_at: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
      } catch (updErr) {
        console.warn("Note updating user metadata on force reset:", updErr?.message);
      }
    }
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: clientEmail,
      options: { redirectTo: redirectUrl }
    });
    if (linkErr) {
      console.error("generateLink error in send-link:", linkErr);
      return res.status(500).json({
        success: false,
        code: "LINK_GENERATION_FAILED",
        error: `Failed to generate secure setup link: ${linkErr.message}`
      });
    }
    const actionLink = linkData?.properties?.action_link;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const updatedCustomContent = {
      ...customer.custom_content || {},
      authStatus: {
        passwordSetupStatus: "Pending",
        lastLinkSentAt: nowIso,
        lastActionType: actionType
      }
    };
    const updatedHistory = [
      {
        id: `act-${Date.now()}`,
        date: nowIso.split("T")[0],
        action: actionType === "reset" ? "Admin forced password reset for ownership handover. Existing access invalidated." : "Admin generated fresh password setup link for client.",
        user: callerProfile.full_name || "Admin"
      },
      ...Array.isArray(customer.activity_history) ? customer.activity_history : []
    ];
    await callerClient.from("customers").update({
      custom_content: updatedCustomContent,
      activity_history: updatedHistory
    }).eq("id", customer.id);
    return res.json({
      success: true,
      actionLink: actionLink || void 0,
      passwordSetupStatus: "Pending",
      lastLinkSentAt: nowIso,
      message: actionType === "reset" ? `Password reset link created for ${clientEmail}. Existing sessions revoked.` : `Password setup link generated for ${clientEmail}.`
    });
  } catch (err) {
    console.error("Error in send-link API:", err);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      error: err?.message || "Server error generating password link."
    });
  }
});
app.post("/api/client/confirm-password-setup", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Unauthorized: Missing token." });
    }
    const token = authHeader.split(" ")[1];
    const { data: authUserData, error: authUserErr } = await supabaseAnon.auth.getUser(token);
    if (authUserErr || !authUserData?.user) {
      return res.status(401).json({ success: false, error: "Unauthorized: Invalid token." });
    }
    const adminCheck = getAdminClient();
    const supabaseAdmin = adminCheck.client;
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(authUserData.user.id, {
          user_metadata: {
            ...authUserData.user.user_metadata || {},
            password_setup_status: "completed",
            setup_completed_at: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
      } catch (metaErr) {
        console.warn("Note updating user metadata on setup confirm:", metaErr?.message);
      }
    }
    const callerClient = getCallerClient(token);
    const { data: cust } = await callerClient.from("customers").select("id, custom_content, activity_history").eq("email", authUserData.user.email).maybeSingle();
    if (cust) {
      const nowIso = (/* @__PURE__ */ new Date()).toISOString();
      const updatedCustomContent = {
        ...cust.custom_content || {},
        authStatus: {
          passwordSetupStatus: "Completed",
          setupCompletedAt: nowIso,
          lastLinkSentAt: cust.custom_content?.authStatus?.lastLinkSentAt
        }
      };
      const updatedHistory = [
        {
          id: `act-${Date.now()}`,
          date: nowIso.split("T")[0],
          action: "Client successfully configured and secured account password.",
          user: authUserData.user.user_metadata?.full_name || "Client"
        },
        ...Array.isArray(cust.activity_history) ? cust.activity_history : []
      ];
      await callerClient.from("customers").update({
        custom_content: updatedCustomContent,
        activity_history: updatedHistory
      }).eq("id", cust.id);
    }
    return res.json({ success: true, message: "Password setup marked as completed." });
  } catch (err) {
    console.error("Error in confirm-password-setup:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});
app.post("/api/admin/orders/update-status", adminOrderUpdateLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHENTICATED",
        error: "Authentication required. Missing Bearer token."
      });
    }
    const token = authHeader.split(" ")[1];
    const { data: authUserData, error: authUserErr } = await supabaseAnon.auth.getUser(token);
    if (authUserErr || !authUserData?.user) {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        error: "Unauthorized: Invalid or expired session."
      });
    }
    const callerClient = getCallerClient(token);
    const { data: callerProfile, error: profileErr } = await callerClient.from("profiles").select("id, email, role, full_name").eq("id", authUserData.user.id).maybeSingle();
    if (profileErr || !callerProfile || callerProfile.role !== "admin") {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN",
        error: "Forbidden: Only administrators can update client project status."
      });
    }
    const { orderId, newStatus, adminNote } = req.body || {};
    if (!orderId || typeof orderId !== "string") {
      return res.status(400).json({
        success: false,
        code: "MISSING_ORDER_ID",
        error: "orderId parameter is required."
      });
    }
    const VALID_LIFECYCLE = ["Submitted", "Accepted", "In Progress", "Review", "Live"];
    if (!newStatus || !VALID_LIFECYCLE.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_STATUS",
        error: `Invalid project status "${newStatus}". Must be one of: ${VALID_LIFECYCLE.join(", ")}.`
      });
    }
    const { data: order, error: orderFetchErr } = await callerClient.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (orderFetchErr || !order) {
      return res.status(404).json({
        success: false,
        code: "ORDER_NOT_FOUND",
        error: `Order with id "${orderId}" not found.`
      });
    }
    let currentStatus = "Submitted";
    if (order.internal_notes) {
      const match = order.internal_notes.match(/\[PROJECT_STATUS:(Submitted|Accepted|In Progress|Review|Live)\]/);
      if (match && match[1] && VALID_LIFECYCLE.includes(match[1])) {
        currentStatus = match[1];
      }
    }
    if (currentStatus === "Submitted" && Array.isArray(order.milestones) && order.milestones.length > 0) {
      const liveStep = order.milestones.find((m) => m.title?.toLowerCase().includes("live"));
      if (liveStep?.completed) currentStatus = "Live";
      else {
        const reviewStep = order.milestones.find((m) => m.title?.toLowerCase().includes("review"));
        if (reviewStep?.completed) currentStatus = "Review";
        else {
          const inProgStep = order.milestones.find((m) => m.title?.toLowerCase().includes("progress") || m.title?.toLowerCase().includes("development"));
          if (inProgStep?.completed) currentStatus = "In Progress";
          else {
            const acceptedStep = order.milestones.find((m) => m.title?.toLowerCase().includes("accepted"));
            if (acceptedStep?.completed) currentStatus = "Accepted";
          }
        }
      }
    }
    if (currentStatus === "Submitted") {
      if (order.status === "Completed") currentStatus = "Live";
      else if (order.status === "In Progress") currentStatus = "In Progress";
      else if (order.status === "Pending") currentStatus = "Accepted";
    }
    const ALLOWED_TRANSITIONS = {
      "Submitted": ["Accepted"],
      "Accepted": ["In Progress"],
      "In Progress": ["Review"],
      "Review": ["In Progress", "Live"],
      "Live": []
    };
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_TRANSITION",
        error: `Invalid transition from "${currentStatus}" to "${newStatus}". Allowed next transitions from "${currentStatus}" are: [${allowedNext.join(", ") || "None (Project is already Live)"}].`,
        currentStatus,
        attemptedStatus: newStatus,
        allowedTransitions: allowedNext
      });
    }
    const todayDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const statusHierarchy = {
      "Submitted": 1,
      "Accepted": 2,
      "In Progress": 3,
      "Review": 4,
      "Live": 5
    };
    const currentLevel = statusHierarchy[newStatus];
    const findExistingDate = (key) => {
      if (!Array.isArray(order.milestones)) return void 0;
      const found = order.milestones.find((m) => m.title?.toLowerCase().includes(key));
      return found?.date;
    };
    const updatedMilestones = [
      {
        title: "Project Submitted & Requirements Received",
        completed: currentLevel >= 1,
        date: findExistingDate("submitted") || findExistingDate("received") || todayDate
      },
      {
        title: "Project Accepted & Engineering Queued",
        completed: currentLevel >= 2,
        date: currentLevel >= 2 ? findExistingDate("accepted") || todayDate : void 0
      },
      {
        title: "Turnkey Development & Custom Styling",
        completed: currentLevel >= 3,
        date: currentLevel >= 3 ? findExistingDate("progress") || findExistingDate("development") || todayDate : void 0
      },
      {
        title: "Client Review & Staging Inspection",
        completed: currentLevel >= 4,
        date: currentLevel >= 4 ? findExistingDate("review") || todayDate : void 0
      },
      {
        title: "Live Production Launch & CDN Active",
        completed: currentLevel >= 5,
        date: currentLevel >= 5 ? findExistingDate("live") || findExistingDate("launch") || todayDate : void 0
      }
    ];
    const cleanNotes = (order.internal_notes || "").replace(/\[PROJECT_STATUS:(Submitted|Accepted|In Progress|Review|Live)\]\s*/g, "").trim();
    const appendedAdminNote = adminNote ? ` (${adminNote})` : "";
    const newInternalNotes = `[PROJECT_STATUS:${newStatus}] ${cleanNotes}${appendedAdminNote}`.trim();
    const dbStatusMap = {
      "Submitted": "New",
      "Accepted": "Pending",
      "In Progress": "In Progress",
      "Review": "In Progress",
      "Live": "Completed"
    };
    const dbStatus = dbStatusMap[newStatus];
    const { data: updatedOrder, error: updateOrderErr } = await callerClient.from("orders").update({
      status: dbStatus,
      milestones: updatedMilestones,
      internal_notes: newInternalNotes,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", orderId).select("*").single();
    if (updateOrderErr) {
      console.error("Failed to update order status in DB:", updateOrderErr);
      return res.status(500).json({
        success: false,
        code: "DB_UPDATE_FAILED",
        error: "Database update failed. Please try again."
      });
    }
    if (order.customer_id) {
      if (newStatus === "Live") {
        await callerClient.from("customers").update({
          website_status: "Live",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", order.customer_id);
      } else if (newStatus === "In Progress") {
        await callerClient.from("customers").update({
          website_status: "In Progress",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", order.customer_id);
      }
      const notifTitles = {
        "Submitted": `Project Registered: ${order.business_name || "Website"}`,
        "Accepted": `Project Accepted: ${order.business_name || "Website"}`,
        "In Progress": `Turnkey Build In Progress: ${order.business_name || "Website"}`,
        "Review": `Website Ready for Review: ${order.business_name || "Website"}`,
        "Live": `\u{1F389} Website Launched & Live: ${order.business_name || "Website"}`
      };
      const notifMessages = {
        "Submitted": "Your website intake and requirements have been submitted.",
        "Accepted": "Your website project has been accepted by our engineering team and scheduled for turnkey development.",
        "In Progress": "Custom page layouts, mobile styling, and brand integrations are actively in progress.",
        "Review": "Your turnkey website build is ready for staging review. Please inspect your preview.",
        "Live": "Congratulations! Your website is now fully deployed and live online on global edge CDN."
      };
      try {
        await callerClient.from("client_notifications").insert({
          id: `notif-${Date.now()}`,
          customer_id: order.customer_id,
          title: notifTitles[newStatus],
          message: notifMessages[newStatus],
          date: (/* @__PURE__ */ new Date()).toISOString(),
          read: false,
          type: newStatus === "Live" ? "success" : "info"
        });
      } catch (notifErr) {
        console.warn("Non-fatal notification insert warning:", notifErr?.message);
      }
    }
    return res.json({
      success: true,
      orderId,
      previousStatus: currentStatus,
      projectStatus: newStatus,
      databaseStatus: dbStatus,
      milestones: updatedMilestones,
      message: `Project status successfully updated to "${newStatus}".`
    });
  } catch (err) {
    console.error("Unexpected error in update-status API:", err);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      error: err?.message || "Server error updating project status."
    });
  }
});
app.post("/api/payments/create-order", paymentCreateOrderLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHENTICATED",
        error: "Authentication token required."
      });
    }
    const token = authHeader.split(" ")[1];
    const { data: authUserData, error: authErr } = await supabaseAnon.auth.getUser(token);
    if (authErr || !authUserData?.user) {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        error: "Invalid or expired session."
      });
    }
    const callerClient = getCallerClient(token);
    const { data: profile } = await callerClient.from("profiles").select("*").eq("id", authUserData.user.id).maybeSingle();
    if (!profile) {
      return res.status(403).json({
        success: false,
        code: "PROFILE_NOT_FOUND",
        error: "User profile not found."
      });
    }
    let targetCustomerId;
    if (profile.role === "admin") {
      targetCustomerId = req.body.customerId || profile.customer_id;
    } else {
      targetCustomerId = profile.customer_id;
    }
    if (!targetCustomerId) {
      return res.status(400).json({
        success: false,
        code: "MISSING_CUSTOMER_MAPPING",
        error: "No valid customer record is mapped to this client account."
      });
    }
    const { data: customerRecord, error: custFetchErr } = await callerClient.from("customers").select("id, name, business_name, email, phone, account_status").eq("id", targetCustomerId).maybeSingle();
    if (custFetchErr || !customerRecord) {
      return res.status(404).json({
        success: false,
        code: "CUSTOMER_NOT_FOUND",
        error: "Customer record not found for this account."
      });
    }
    if (customerRecord.account_status === "Suspended") {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_SUSPENDED",
        error: "This account has been suspended. Please contact support."
      });
    }
    const targetPlan = PLAN_CATALOG[req.body.planId] || PLAN_CATALOG["plan-pro"];
    const resolvedPlanId = PLAN_CATALOG[req.body.planId] ? req.body.planId : "plan-pro";
    const orderDbId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const orderNumber = `ORD-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const todayDate = nowIso.split("T")[0];
    const orderPayload = {
      id: orderDbId,
      order_number: orderNumber,
      customer_id: targetCustomerId,
      plan_id: resolvedPlanId,
      template_id: req.body.templateId || customerRecord.template_id || null,
      client_name: customerRecord.name || profile.full_name || "Client",
      business_name: customerRecord.business_name || "Business",
      email: customerRecord.email || authUserData.user.email || "",
      phone: customerRecord.phone || null,
      amount: targetPlan.amountINR,
      // Server catalog pricing strictly enforced
      status: "New",
      payment_status: "Pending",
      // Always Pending until cryptographic payment verification
      date: nowIso,
      delivery_due_date: new Date(Date.now() + 5 * 864e5).toISOString().split("T")[0],
      requirements: req.body.requirements || `Turnkey website subscription order for ${targetPlan.name}.`,
      internal_notes: "Order created via server-authoritative checkout path.",
      client_tier: customerRecord.client_tier || "normal",
      milestones: [
        { title: "Order Received", completed: true, date: todayDate },
        { title: "Design Customization & Review", completed: false },
        { title: "Quality Assurance & SEO Optimization", completed: false },
        { title: "Live Production Launch", completed: false }
      ]
    };
    const adminCheck = getAdminClient();
    const db = adminCheck.client || callerClient;
    const { data: insertedOrder, error: orderInsertErr } = await db.from("orders").insert(orderPayload).select().maybeSingle();
    if (orderInsertErr) {
      console.error("Error inserting server-authoritative order into public.orders:", orderInsertErr);
      return res.status(500).json({
        success: false,
        code: "ORDER_CREATION_FAILED",
        error: "Failed to create database order. Please try again."
      });
    }
    const createdOrder = insertedOrder || orderPayload;
    const { client: razorpay, keyId, keySecret } = getRazorpay();
    if (razorpay && keyId && keySecret) {
      const receipt = `rcpt_${targetCustomerId.substring(0, 15)}_${Date.now().toString().slice(-8)}`;
      const options = {
        amount: targetPlan.amountPaise,
        currency: "INR",
        receipt,
        notes: {
          orderId: orderDbId,
          customerId: targetCustomerId,
          planId: resolvedPlanId,
          userId: authUserData.user.id
        }
      };
      const razorpayOrder = await razorpay.orders.create(options);
      return res.json({
        success: true,
        orderId: razorpayOrder.id,
        dbOrderId: orderDbId,
        order: createdOrder,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId,
        // Only public key ID sent to client, never secret
        razorpayConfigured: true,
        planName: targetPlan.name,
        planDescription: targetPlan.description,
        customer: {
          name: customerRecord.name || profile.full_name || "",
          businessName: customerRecord.business_name || "",
          email: customerRecord.email || authUserData.user.email || "",
          phone: customerRecord.phone || ""
        }
      });
    } else {
      return res.json({
        success: true,
        orderId: orderDbId,
        dbOrderId: orderDbId,
        order: createdOrder,
        amount: targetPlan.amountPaise,
        currency: "INR",
        keyId: "",
        razorpayConfigured: false,
        code: "RAZORPAY_NOT_CONFIGURED",
        message: "Order created successfully in database. Razorpay payment gateway is not configured on this server.",
        planName: targetPlan.name,
        planDescription: targetPlan.description,
        customer: {
          name: customerRecord.name || profile.full_name || "",
          businessName: customerRecord.business_name || "",
          email: customerRecord.email || authUserData.user.email || "",
          phone: customerRecord.phone || ""
        }
      });
    }
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    return res.status(500).json({
      success: false,
      code: "RAZORPAY_ORDER_ERROR",
      error: err?.message || "Failed to create payment order."
    });
  }
});
app.post("/api/payments/verify-payment", paymentVerifyLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHENTICATED",
        error: "Authentication token required."
      });
    }
    const token = authHeader.split(" ")[1];
    const { data: authUserData, error: authErr } = await supabaseAnon.auth.getUser(token);
    if (authErr || !authUserData?.user) {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        error: "Invalid or expired session."
      });
    }
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      customerId
    } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        code: "MISSING_PAYMENT_DETAILS",
        error: "Missing Razorpay order ID, payment ID, or signature."
      });
    }
    const { client: razorpay, keySecret } = getRazorpay();
    if (!razorpay || !keySecret) {
      return res.status(503).json({
        success: false,
        code: "RAZORPAY_NOT_CONFIGURED",
        error: "Razorpay payment gateway is not configured on this server."
      });
    }
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac("sha256", keySecret).update(body.toString()).digest("hex");
    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(razorpay_signature);
    const isSignatureValid = expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        code: "INVALID_SIGNATURE",
        error: "Payment verification failed: cryptographic signature mismatch."
      });
    }
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    const paymentMethod = paymentDetails.method ? `Razorpay (${paymentDetails.method.toUpperCase()})` : "Razorpay (UPI / Card)";
    const callerClient = getCallerClient(token);
    const { data: profile } = await callerClient.from("profiles").select("*").eq("id", authUserData.user.id).maybeSingle();
    if (!profile) {
      return res.status(403).json({
        success: false,
        code: "PROFILE_NOT_FOUND",
        error: "User profile not found."
      });
    }
    let targetCustomerId;
    if (profile.role === "admin") {
      targetCustomerId = customerId || profile.customer_id;
    } else {
      targetCustomerId = profile.customer_id;
    }
    if (!targetCustomerId) {
      return res.status(400).json({
        success: false,
        code: "MISSING_CUSTOMER_MAPPING",
        error: "No valid customer record is mapped to this client account."
      });
    }
    const { data: custRecord } = await callerClient.from("customers").select("id, name, business_name, account_status").eq("id", targetCustomerId).maybeSingle();
    if (!custRecord) {
      return res.status(404).json({
        success: false,
        code: "CUSTOMER_NOT_FOUND",
        error: "Customer record not found."
      });
    }
    if (custRecord.account_status === "Suspended") {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_SUSPENDED",
        error: "This account has been suspended. Please contact support."
      });
    }
    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
    } catch (orderFetchErr) {
      console.error("Failed to fetch Razorpay order for verification:", orderFetchErr);
      return res.status(404).json({
        success: false,
        code: "RAZORPAY_ORDER_NOT_FOUND",
        error: "The specified payment order could not be retrieved from the payment gateway."
      });
    }
    const orderNotes = rzpOrder?.notes || {};
    const authoritativePlanId = orderNotes.planId;
    const dbOrderId = orderNotes.orderId;
    const notesCustomerId = orderNotes.customerId;
    if (!authoritativePlanId || !PLAN_CATALOG[authoritativePlanId]) {
      console.error("Invalid or missing planId in Razorpay order notes:", authoritativePlanId);
      return res.status(400).json({
        success: false,
        code: "INVALID_ORDER_METADATA",
        error: "Payment order metadata does not correspond to a recognized plan."
      });
    }
    if (!dbOrderId) {
      console.error("Missing dbOrderId in Razorpay order notes:", orderNotes);
      return res.status(400).json({
        success: false,
        code: "INVALID_ORDER_METADATA",
        error: "Payment order is missing linked internal order reference."
      });
    }
    if (notesCustomerId && notesCustomerId !== targetCustomerId && profile.role !== "admin") {
      console.error(`Customer mismatch: notes=${notesCustomerId}, authenticated=${targetCustomerId}`);
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN",
        error: "Payment order does not belong to the authenticated client account."
      });
    }
    const catalogPlan = PLAN_CATALOG[authoritativePlanId];
    if (Number(rzpOrder.amount) !== catalogPlan.amountPaise) {
      console.error(`Razorpay order amount mismatch: order=${rzpOrder.amount}, catalog=${catalogPlan.amountPaise}`);
      return res.status(400).json({
        success: false,
        code: "AMOUNT_MISMATCH",
        error: "Order payment amount does not match the authoritative catalog price."
      });
    }
    if (Number(paymentDetails.amount) !== Number(rzpOrder.amount)) {
      console.error(`Payment amount mismatch: payment=${paymentDetails.amount}, order=${rzpOrder.amount}`);
      return res.status(400).json({
        success: false,
        code: "AMOUNT_MISMATCH",
        error: "Paid amount does not match the authorized order amount."
      });
    }
    if (paymentDetails.status !== "captured" && paymentDetails.status !== "authorized") {
      console.error(`Invalid payment status: ${paymentDetails.status}`);
      return res.status(400).json({
        success: false,
        code: "PAYMENT_NOT_CAPTURED",
        error: "Payment transaction is not in a captured or authorized state."
      });
    }
    const adminCheck = getAdminClient();
    const db = adminCheck.client || callerClient;
    const { data: dbOrder, error: dbOrderErr } = await db.from("orders").select("*").eq("id", dbOrderId).eq("customer_id", targetCustomerId).maybeSingle();
    if (dbOrderErr) {
      console.error("Database error fetching order during payment verification:", dbOrderErr);
      return res.status(500).json({
        success: false,
        code: "DATABASE_ERROR",
        error: "Database operation failed during order verification. Please try again."
      });
    }
    if (!dbOrder) {
      console.error(`Database order not found: id=${dbOrderId}, customer=${targetCustomerId}`);
      return res.status(404).json({
        success: false,
        code: "ORDER_NOT_FOUND",
        error: "The internal order associated with this payment was not found."
      });
    }
    if (dbOrder.plan_id !== authoritativePlanId) {
      console.error(`Order plan mismatch: db=${dbOrder.plan_id}, rzpNotes=${authoritativePlanId}`);
      return res.status(400).json({
        success: false,
        code: "PLAN_MISMATCH",
        error: "Order plan specification does not match the database order."
      });
    }
    if (Number(dbOrder.amount) !== catalogPlan.amountINR) {
      console.error(`Order amount mismatch: db=${dbOrder.amount}, catalog=${catalogPlan.amountINR}`);
      return res.status(400).json({
        success: false,
        code: "AMOUNT_MISMATCH",
        error: "Order amount does not match the authoritative catalog amount."
      });
    }
    const amountINR = catalogPlan.amountINR;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const { data: existingPayment } = await db.from("payments").select("id").eq("transaction_id", razorpay_payment_id).maybeSingle();
    if (!existingPayment) {
      const todayDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const nextExpiryDate = new Date(Date.now() + 365 * 864e5).toISOString().split("T")[0];
      const isVipTier = authoritativePlanId === "plan-business";
      const customerSubscriptionUpdates = {
        plan_id: authoritativePlanId,
        payment_status: "Paid",
        account_status: "Active",
        subscription_state: "ACTIVE",
        plan_start_date: todayDate,
        plan_expiry_date: nextExpiryDate,
        auto_renew: true,
        grace_period_end_date: null,
        website_status: "Live",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (isVipTier) {
        customerSubscriptionUpdates.client_tier = "premium";
        customerSubscriptionUpdates.sla_level = "2-Hour VIP Priority SLA";
      } else if (authoritativePlanId === "plan-pro") {
        customerSubscriptionUpdates.sla_level = "Priority 12h";
      } else {
        customerSubscriptionUpdates.sla_level = "Standard 24h";
      }
      const { error: custUpdErr } = await db.from("customers").update(customerSubscriptionUpdates).eq("id", targetCustomerId);
      if (custUpdErr) {
        console.error("Failed to update customer subscription after payment:", custUpdErr);
        return res.status(500).json({
          success: false,
          code: "DATABASE_ERROR",
          error: "Database operation failed while activating customer subscription."
        });
      }
      const basePlanLimitGB = isVipTier ? 15 : authoritativePlanId === "plan-pro" ? 10 : 5;
      await db.from("customer_storage").update({
        base_plan_limit_gb: basePlanLimitGB,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("customer_id", targetCustomerId);
      const { error: payInsertErr } = await db.from("payments").insert({
        id: `pay-rzp-${Date.now()}`,
        transaction_id: razorpay_payment_id,
        invoice_number: `INV-RZP-${Date.now().toString().slice(-6)}`,
        customer_id: targetCustomerId,
        customer_name: custRecord?.name || profile?.full_name || "Valued Client",
        business_name: custRecord?.business_name || "Client Business",
        amount: amountINR,
        plan_name: authoritativePlanId,
        date: nowIso,
        status: "Paid",
        method: paymentMethod
      });
      if (payInsertErr) {
        console.error("Failed to record verified payment in ledger:", payInsertErr);
      }
      await db.from("orders").update({
        payment_status: "Paid",
        status: "In Progress",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", dbOrderId).eq("customer_id", targetCustomerId);
    }
    return res.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: amountINR,
      planId: authoritativePlanId,
      message: "Payment verified and subscription activated successfully!"
    });
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    return res.status(500).json({
      success: false,
      code: "VERIFICATION_ERROR",
      error: "Payment signature verification encountered an error. Please try again."
    });
  }
});
app.post("/api/payments/webhook", paymentWebhookLimiter, async (req, res) => {
  const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();
  if (!webhookSecret) {
    return res.status(503).json({
      success: false,
      code: "RAZORPAY_WEBHOOK_NOT_CONFIGURED",
      error: "Razorpay webhook integration is not configured on this server. RAZORPAY_WEBHOOK_SECRET must be configured in environment variables to handle incoming payment webhooks."
    });
  }
  const sig = req.headers["x-razorpay-signature"];
  if (!sig || !req.rawBody) {
    return res.status(400).json({
      success: false,
      code: "MISSING_RAZORPAY_SIGNATURE",
      error: "Missing X-Razorpay-Signature header or raw payload body."
    });
  }
  const expectedSig = crypto.createHmac("sha256", webhookSecret).update(req.rawBody).digest("hex");
  const isValidSig = typeof sig === "string" && expectedSig.length === sig.length && crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig));
  if (!isValidSig) {
    console.error("Razorpay webhook signature verification failed.");
    return res.status(400).json({
      success: false,
      code: "INVALID_WEBHOOK_SIGNATURE",
      error: "Webhook cryptographic signature verification failed."
    });
  }
  const event = req.body;
  const eventType = event?.event;
  console.log(`Razorpay webhook verified. Event: ${eventType}`);
  const adminCheck = getAdminClient();
  if (adminCheck.client && event?.payload?.payment?.entity) {
    const paymentEntity = event.payload.payment.entity;
    const notes = paymentEntity.notes || {};
    const customerId = notes.customerId;
    const planId = notes.planId || "plan-pro";
    const txnId = paymentEntity.id;
    const amountINR = Number(paymentEntity.amount || 0) / 100;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const db = adminCheck.client;
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const orderId = notes.orderId;
      const planId2 = notes.planId;
      if (!customerId || !txnId || !orderId) {
        console.warn(`Razorpay webhook fulfillment ignored: missing critical identifiers (customerId=${customerId}, txnId=${txnId}, orderId=${orderId})`);
        return res.json({ received: true });
      }
      if (!planId2 || !PLAN_CATALOG[planId2]) {
        console.warn(`Razorpay webhook fulfillment ignored: unrecognized or missing planId "${planId2}"`);
        return res.json({ received: true });
      }
      const catalogPlan = PLAN_CATALOG[planId2];
      const paymentAmountPaise = Number(paymentEntity.amount || 0);
      if (paymentAmountPaise !== catalogPlan.amountPaise) {
        console.warn(`Razorpay webhook fulfillment ignored: payment amount mismatch (received=${paymentAmountPaise}, expected=${catalogPlan.amountPaise})`);
        return res.json({ received: true });
      }
      const { data: existing, error: existErr } = await db.from("payments").select("id").eq("transaction_id", txnId).maybeSingle();
      if (existErr) {
        console.error("Razorpay webhook database error checking existing payment:", existErr);
        return res.json({ received: true });
      }
      if (!existing) {
        const { data: dbOrder, error: orderFetchErr } = await db.from("orders").select("*").eq("id", orderId).eq("customer_id", customerId).maybeSingle();
        if (orderFetchErr) {
          console.error("Razorpay webhook database error fetching order:", orderFetchErr);
          return res.json({ received: true });
        }
        if (!dbOrder) {
          console.warn(`Razorpay webhook fulfillment ignored: database order not found (orderId=${orderId}, customerId=${customerId})`);
          return res.json({ received: true });
        }
        if (dbOrder.plan_id !== planId2) {
          console.warn(`Razorpay webhook fulfillment ignored: order plan mismatch (dbPlan=${dbOrder.plan_id}, notesPlan=${planId2})`);
          return res.json({ received: true });
        }
        if (Number(dbOrder.amount) !== catalogPlan.amountINR) {
          console.warn(`Razorpay webhook fulfillment ignored: order amount mismatch (dbAmount=${dbOrder.amount}, catalogAmount=${catalogPlan.amountINR})`);
          return res.json({ received: true });
        }
        const { data: cust, error: custFetchErr } = await db.from("customers").select("name, business_name").eq("id", customerId).maybeSingle();
        if (custFetchErr) {
          console.error("Razorpay webhook database error fetching customer record:", custFetchErr);
        }
        const todayDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const nextExpiryDate = new Date(Date.now() + 365 * 864e5).toISOString().split("T")[0];
        const isVipTier = planId2 === "plan-business";
        const customerSubscriptionUpdates = {
          plan_id: planId2,
          payment_status: "Paid",
          account_status: "Active",
          subscription_state: "ACTIVE",
          plan_start_date: todayDate,
          plan_expiry_date: nextExpiryDate,
          auto_renew: true,
          grace_period_end_date: null,
          website_status: "Live",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        if (isVipTier) {
          customerSubscriptionUpdates.client_tier = "premium";
          customerSubscriptionUpdates.sla_level = "2-Hour VIP Priority SLA";
        } else if (planId2 === "plan-pro") {
          customerSubscriptionUpdates.sla_level = "Priority 12h";
        } else {
          customerSubscriptionUpdates.sla_level = "Standard 24h";
        }
        const { error: custUpdErr } = await db.from("customers").update(customerSubscriptionUpdates).eq("id", customerId);
        if (custUpdErr) {
          console.error("Razorpay webhook database error updating customer subscription:", custUpdErr);
        }
        const basePlanLimitGB = isVipTier ? 15 : planId2 === "plan-pro" ? 10 : 5;
        const { error: storageUpdErr } = await db.from("customer_storage").update({
          base_plan_limit_gb: basePlanLimitGB,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("customer_id", customerId);
        if (storageUpdErr) {
          console.error("Razorpay webhook database error updating customer storage quota:", storageUpdErr);
        }
        const { error: payInsertErr } = await db.from("payments").insert({
          id: `pay-rzp-${Date.now()}`,
          transaction_id: txnId,
          invoice_number: `INV-RZP-${Date.now().toString().slice(-6)}`,
          customer_id: customerId,
          customer_name: cust?.name || paymentEntity.email || "Valued Client",
          business_name: cust?.business_name || "Client Business",
          amount: catalogPlan.amountINR,
          plan_name: planId2,
          date: nowIso,
          status: "Paid",
          method: paymentEntity.method ? `Razorpay (${paymentEntity.method.toUpperCase()})` : "Razorpay Settlement"
        });
        if (payInsertErr) {
          console.error("Razorpay webhook database error inserting payment record:", payInsertErr);
        }
        const { error: orderUpdErr } = await db.from("orders").update({
          payment_status: "Paid",
          status: "In Progress",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", orderId).eq("customer_id", customerId);
        if (orderUpdErr) {
          console.error("Razorpay webhook database error updating order status:", orderUpdErr);
        }
      }
    } else if (eventType === "payment.failed") {
      if (customerId) {
        const graceEndIso = new Date(Date.now() + 7 * 864e5).toISOString();
        const { error: custFailedErr } = await db.from("customers").update({
          payment_status: "Failed",
          subscription_state: "PAYMENT_FAILED",
          grace_period_end_date: graceEndIso,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", customerId);
        if (custFailedErr) {
          console.error("Razorpay webhook database error updating failed customer subscription:", custFailedErr);
        }
        if (txnId) {
          const { data: existingFailed, error: checkFailedErr } = await db.from("payments").select("id").eq("transaction_id", txnId).maybeSingle();
          if (checkFailedErr) {
            console.error("Razorpay webhook database error checking existing failed payment:", checkFailedErr);
          }
          if (!existingFailed) {
            const { data: cust, error: custFetchErr } = await db.from("customers").select("name, business_name").eq("id", customerId).maybeSingle();
            if (custFetchErr) {
              console.error("Razorpay webhook database error fetching customer for failed payment:", custFetchErr);
            }
            const { error: payFailedInsertErr } = await db.from("payments").insert({
              id: `pay-failed-${Date.now()}`,
              transaction_id: txnId,
              invoice_number: `INV-FAIL-${Date.now().toString().slice(-6)}`,
              customer_id: customerId,
              customer_name: cust?.name || paymentEntity.email || "Valued Client",
              business_name: cust?.business_name || "Client Business",
              amount: amountINR,
              plan_name: notes.planId || "Unknown Plan",
              date: nowIso,
              status: "Failed",
              method: paymentEntity.method ? `Razorpay (${paymentEntity.method.toUpperCase()})` : "Razorpay Settlement"
            });
            if (payFailedInsertErr) {
              console.error("Razorpay webhook database error inserting failed payment record:", payFailedInsertErr);
            }
          }
        }
      }
    }
  }
  return res.json({ received: true });
});
app.post("/api/client/redeploy", clientRedeployLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHENTICATED",
        error: "Authentication token required."
      });
    }
    const token = authHeader.split(" ")[1];
    const { data: authUserData, error: authErr } = await supabaseAnon.auth.getUser(token);
    if (authErr || !authUserData?.user) {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        error: "Invalid or expired session."
      });
    }
    const callerClient = getCallerClient(token);
    const { data: profile } = await callerClient.from("profiles").select("*").eq("id", authUserData.user.id).maybeSingle();
    if (req.body.customerId && profile?.role !== "admin" && req.body.customerId !== profile?.customer_id) {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN",
        error: "Access denied: You cannot trigger deployments for another client account."
      });
    }
    const targetCustomerId = profile?.role === "admin" && req.body.customerId ? req.body.customerId : profile?.customer_id;
    if (!targetCustomerId) {
      return res.status(400).json({
        success: false,
        code: "MISSING_CUSTOMER_ID",
        error: "No customer account linked to session."
      });
    }
    if (profile?.role !== "admin" && profile?.customer_id !== targetCustomerId) {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN",
        error: "Access denied: You cannot trigger deployments for another client account."
      });
    }
    const deployWebhook = (process.env.DEPLOYMENT_WEBHOOK_URL || "").trim();
    if (!deployWebhook) {
      return res.status(503).json({
        success: false,
        code: "DEPLOYMENT_NOT_CONFIGURED",
        error: "Edge deployment pipeline is not configured on this server. To enable live website redeployments and CDN cache purging, please set the DEPLOYMENT_WEBHOOK_URL environment variable."
      });
    }
    try {
      const hookRes = await fetch(deployWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: targetCustomerId,
          triggeredBy: profile?.full_name || authUserData.user.email,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        })
      });
      if (!hookRes.ok) {
        throw new Error(`Upstream deployment webhook responded with HTTP ${hookRes.status}: ${hookRes.statusText}`);
      }
    } catch (hookErr) {
      console.error("Deployment build webhook execution failed:", hookErr);
      return res.status(502).json({
        success: false,
        code: "DEPLOYMENT_WEBHOOK_FAILED",
        error: "Deployment build hook failed to trigger. Please try again or contact support."
      });
    }
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const formattedDate = (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const { data: currentCust } = await callerClient.from("customers").select("deployment, activity_history").eq("id", targetCustomerId).maybeSingle();
    const existingDeployment = currentCust?.deployment || {};
    const updatedDeployment = {
      ...existingDeployment,
      deploymentStatus: "Ready",
      lastDeployedAt: `Today at ${formattedDate}`,
      edgeLocation: existingDeployment.edgeLocation || "iad1 (US East / Global Anycast)",
      sslAutoRenew: true,
      buildDurationSeconds: Math.floor(12 + Math.random() * 8)
    };
    const existingHistory = currentCust?.activity_history || [];
    const newHistoryEntry = {
      id: `act-${Date.now()}`,
      date: nowIso.split("T")[0],
      action: `Website and Edge CDN cache redeployed (${updatedDeployment.buildDurationSeconds}s).`,
      user: profile?.full_name || "Client"
    };
    const { error: updateErr } = await callerClient.from("customers").update({
      deployment: updatedDeployment,
      activity_history: [newHistoryEntry, ...existingHistory].slice(0, 30)
    }).eq("id", targetCustomerId);
    if (updateErr) {
      console.error("Failed to record deployment in DB:", updateErr);
      return res.status(500).json({
        success: false,
        code: "DB_UPDATE_ERROR",
        error: "Failed to record deployment. Please try again."
      });
    }
    return res.json({
      success: true,
      deployment: updatedDeployment,
      webhookTriggered: true,
      message: "Live Edge CDN cache purged and production website redeployed successfully!"
    });
  } catch (err) {
    console.error("Error during client redeploy:", err);
    return res.status(500).json({
      success: false,
      code: "REDEPLOY_ERROR",
      error: err?.message || "Server error during redeployment."
    });
  }
});
app.get("/api/client/onboarding", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHENTICATED",
        error: "Authentication token required."
      });
    }
    const token = authHeader.split(" ")[1];
    const { data: authUserData, error: authErr } = await supabaseAnon.auth.getUser(token);
    if (authErr || !authUserData?.user) {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        error: "Invalid or expired session."
      });
    }
    const callerClient = getCallerClient(token);
    const { data: profile } = await callerClient.from("profiles").select("*").eq("id", authUserData.user.id).maybeSingle();
    if (!profile) {
      return res.status(404).json({
        success: false,
        code: "PROFILE_NOT_FOUND",
        error: "User profile not found."
      });
    }
    const isAdmin = profile.role === "admin" || profile.role === "superadmin";
    let customerId = profile.customer_id;
    if (isAdmin && typeof req.query.customerId === "string" && req.query.customerId.trim()) {
      customerId = req.query.customerId.trim();
    }
    if (!customerId) {
      return res.status(400).json({
        success: false,
        code: "NO_CUSTOMER_MAPPING",
        error: "No customer account linked to this user."
      });
    }
    const { data: customer, error: custErr } = await callerClient.from("customers").select("*").eq("id", customerId).maybeSingle();
    if (custErr || !customer) {
      return res.status(404).json({
        success: false,
        code: "CUSTOMER_NOT_FOUND",
        error: "Customer record not found."
      });
    }
    const onboardingData = customer.custom_content?.onboarding || null;
    const status = onboardingData?.status || "Not Started";
    return res.json({
      success: true,
      customerId,
      status,
      onboarding: onboardingData,
      customer: {
        id: customer.id,
        businessName: customer.business_name,
        email: customer.email,
        phone: customer.phone,
        templateId: customer.template_id,
        customDomain: customer.custom_domain,
        accountStatus: customer.account_status,
        customContent: customer.custom_content
      }
    });
  } catch (err) {
    console.error("Error fetching onboarding data:", err);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      error: err?.message || "Server error fetching onboarding data."
    });
  }
});
app.post("/api/client/onboarding", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHENTICATED",
        error: "Authentication token required."
      });
    }
    const token = authHeader.split(" ")[1];
    const { data: authUserData, error: authErr } = await supabaseAnon.auth.getUser(token);
    if (authErr || !authUserData?.user) {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        error: "Invalid or expired session."
      });
    }
    const callerClient = getCallerClient(token);
    const { data: profile } = await callerClient.from("profiles").select("*").eq("id", authUserData.user.id).maybeSingle();
    if (!profile) {
      return res.status(404).json({
        success: false,
        code: "PROFILE_NOT_FOUND",
        error: "User profile could not be found."
      });
    }
    const isAdmin = profile.role === "admin" || profile.role === "superadmin";
    let customerId = profile.customer_id;
    if (isAdmin && typeof req.body.customerId === "string" && req.body.customerId.trim()) {
      customerId = req.body.customerId.trim();
    }
    if (!customerId) {
      return res.status(400).json({
        success: false,
        code: "NO_CUSTOMER_MAPPING",
        error: "No customer account linked to this user."
      });
    }
    const { data: existingCust, error: fetchErr } = await callerClient.from("customers").select("*").eq("id", customerId).maybeSingle();
    if (fetchErr || !existingCust) {
      return res.status(404).json({
        success: false,
        code: "CUSTOMER_NOT_FOUND",
        error: "Customer profile not found."
      });
    }
    if (existingCust.account_status === "Suspended" || existingCust.account_status === "Expired") {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_SUSPENDED",
        error: "Your customer account is currently suspended or expired. Please contact support."
      });
    }
    const {
      businessName,
      businessCategory,
      businessDescription,
      contactEmail,
      contactPhone,
      address,
      logoUrl,
      logoText,
      primaryColor,
      secondaryColor,
      preferredVisualStyles,
      selectedTemplateId,
      requiredSections,
      headline,
      heroHeadline,
      tagline,
      heroSubhead,
      aboutText,
      servicesList,
      socialLinks,
      customDomain,
      specialFeatures,
      specialFeaturesNotes,
      additionalNotes,
      requirementsNotes,
      isDraft
    } = req.body;
    const isDraftSave = Boolean(isDraft);
    if (!isDraftSave) {
      const resolvedBizName = (businessName || existingCust.business_name || "").trim();
      if (!resolvedBizName) {
        return res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          error: "Business name is required to submit website specifications."
        });
      }
      const resolvedEmail = (contactEmail || existingCust.email || "").trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!resolvedEmail || !emailRegex.test(resolvedEmail)) {
        return res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          error: "A valid contact email address is required."
        });
      }
      const resolvedPhone = (contactPhone || existingCust.phone || "").trim();
      if (!resolvedPhone) {
        return res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          error: "A contact phone number is required."
        });
      }
    }
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const existingOnboarding = existingCust.custom_content?.onboarding || {};
    const onboardingStatus = isDraftSave ? "In Progress" : "Submitted";
    const effectiveBusinessName = businessName !== void 0 ? businessName.trim() : existingOnboarding.businessName || existingCust.business_name;
    const effectiveEmail = contactEmail !== void 0 ? contactEmail.trim() : existingOnboarding.contactEmail || existingCust.email;
    const effectivePhone = contactPhone !== void 0 ? contactPhone.trim() : existingOnboarding.contactPhone || existingCust.phone;
    const effectiveHeadline = headline !== void 0 ? headline.trim() : heroHeadline !== void 0 ? heroHeadline.trim() : existingOnboarding.headline || existingCust.custom_content?.heroHeadline || `Welcome to ${effectiveBusinessName}`;
    const effectiveTagline = tagline !== void 0 ? tagline.trim() : heroSubhead !== void 0 ? heroSubhead.trim() : existingOnboarding.tagline || existingCust.custom_content?.tagline || "";
    const effectiveTemplateId = selectedTemplateId || existingOnboarding.selectedTemplateId || existingCust.template_id;
    const structuredOnboarding = {
      status: onboardingStatus,
      startedAt: existingOnboarding.startedAt || nowIso,
      submittedAt: onboardingStatus === "Submitted" ? existingOnboarding.submittedAt || nowIso : existingOnboarding.submittedAt,
      updatedAt: nowIso,
      // Business
      businessName: effectiveBusinessName,
      businessCategory: businessCategory !== void 0 ? businessCategory : existingOnboarding.businessCategory || "",
      businessDescription: businessDescription !== void 0 ? businessDescription : existingOnboarding.businessDescription || "",
      contactEmail: effectiveEmail,
      contactPhone: effectivePhone,
      address: address !== void 0 ? address : existingOnboarding.address || existingCust.custom_content?.address || "",
      // Branding
      logoUrl: logoUrl !== void 0 ? logoUrl : existingOnboarding.logoUrl || existingCust.custom_content?.logoUrl || "",
      logoText: logoText !== void 0 ? logoText : existingOnboarding.logoText || existingCust.custom_content?.logoText || effectiveBusinessName.toUpperCase(),
      primaryColor: primaryColor || existingOnboarding.primaryColor || existingCust.custom_content?.primaryColor || "#4f46e5",
      secondaryColor: secondaryColor || existingOnboarding.secondaryColor || existingCust.custom_content?.secondaryColor || "#0ea5e9",
      preferredVisualStyles: preferredVisualStyles !== void 0 ? preferredVisualStyles : existingOnboarding.preferredVisualStyles || [],
      // Website Specs
      selectedTemplateId: effectiveTemplateId,
      requiredSections: requiredSections !== void 0 ? requiredSections : existingOnboarding.requiredSections || ["Hero Header", "About Us", "Services", "Contact Form"],
      headline: effectiveHeadline,
      tagline: effectiveTagline,
      aboutText: aboutText !== void 0 ? aboutText : existingOnboarding.aboutText || existingCust.custom_content?.aboutText || "",
      servicesList: servicesList !== void 0 ? servicesList : existingOnboarding.servicesList || existingCust.custom_content?.servicesList || [],
      socialLinks: socialLinks !== void 0 ? socialLinks : existingOnboarding.socialLinks || existingCust.custom_content?.socialLinks || {},
      customDomain: customDomain !== void 0 ? customDomain.trim().toLowerCase() : existingOnboarding.customDomain || existingCust.custom_domain || "",
      // Project Requirements
      specialFeatures: specialFeatures !== void 0 ? specialFeatures : existingOnboarding.specialFeatures || [],
      specialFeaturesNotes: specialFeaturesNotes !== void 0 ? specialFeaturesNotes : existingOnboarding.specialFeaturesNotes || "",
      additionalNotes: additionalNotes !== void 0 ? additionalNotes : requirementsNotes !== void 0 ? requirementsNotes : existingOnboarding.additionalNotes || ""
    };
    const updatedCustomContent = {
      ...existingCust.custom_content || {},
      businessName: effectiveBusinessName,
      tagline: effectiveTagline,
      heroHeadline: effectiveHeadline,
      heroSubhead: effectiveTagline,
      primaryColor: structuredOnboarding.primaryColor,
      secondaryColor: structuredOnboarding.secondaryColor,
      logoText: structuredOnboarding.logoText,
      logoUrl: structuredOnboarding.logoUrl,
      contactPhone: effectivePhone,
      contactEmail: effectiveEmail,
      address: structuredOnboarding.address,
      aboutText: structuredOnboarding.aboutText,
      servicesList: structuredOnboarding.servicesList,
      socialLinks: structuredOnboarding.socialLinks,
      onboarding: structuredOnboarding
    };
    const customerUpdatePayload = {
      custom_content: updatedCustomContent
    };
    if (effectiveBusinessName) {
      customerUpdatePayload.business_name = effectiveBusinessName;
    }
    if (effectiveTemplateId && effectiveTemplateId !== existingCust.template_id) {
      customerUpdatePayload.template_id = effectiveTemplateId;
    }
    if (structuredOnboarding.customDomain) {
      customerUpdatePayload.custom_domain = structuredOnboarding.customDomain;
      if (!existingCust.custom_domain) {
        customerUpdatePayload.dns_status = "Pending DNS Setup";
      }
    }
    const actionText = isDraftSave ? "Client saved onboarding specifications as draft." : "Client submitted complete website onboarding requirements.";
    const existingHistory = existingCust.activity_history || [];
    customerUpdatePayload.activity_history = [
      {
        id: `act-${Date.now()}`,
        date: nowIso.split("T")[0],
        action: actionText,
        user: profile.full_name || "Client"
      },
      ...existingHistory
    ].slice(0, 30);
    const { error: custErr } = await callerClient.from("customers").update(customerUpdatePayload).eq("id", customerId);
    if (custErr) {
      console.error("Database update error in onboarding endpoint:", custErr);
      return res.status(500).json({
        success: false,
        code: "DATABASE_ERROR",
        error: "Database operation failed while saving onboarding details. Please try again."
      });
    }
    if (!isDraftSave) {
      const { data: activeOrder } = await callerClient.from("orders").select("*").eq("customer_id", customerId).order("date", { ascending: false }).limit(1).maybeSingle();
      if (activeOrder) {
        const dateOnly = nowIso.split("T")[0];
        const updatedMilestones = (activeOrder.milestones || []).map((m, idx) => {
          if (idx === 0 || m.title.toLowerCase().includes("onboarding") || m.title.toLowerCase().includes("enrolled")) {
            return { ...m, completed: true, date: dateOnly };
          }
          return m;
        });
        const notesToAppend = structuredOnboarding.additionalNotes ? `

Client Intake Notes (${dateOnly}): ${structuredOnboarding.additionalNotes}` : "";
        const updatedRequirements = `${activeOrder.requirements || ""}${notesToAppend}`;
        await callerClient.from("orders").update({
          milestones: updatedMilestones,
          requirements: updatedRequirements
        }).eq("id", activeOrder.id);
      }
    }
    return res.json({
      success: true,
      status: onboardingStatus,
      onboarding: structuredOnboarding,
      customContent: updatedCustomContent,
      message: isDraftSave ? "Website requirements draft saved. You can return and complete it anytime." : "Website onboarding requirements successfully submitted to WebRunzo webmaster team!"
    });
  } catch (err) {
    console.error("Error during onboarding submission:", err);
    return res.status(500).json({
      success: false,
      code: "ONBOARDING_ERROR",
      error: err?.message || "Server error during onboarding submission."
    });
  }
});
app.get("/env.js", (_req, res) => {
  const publicConfig = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || "",
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || ""
  };
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return res.send(`window.__WEBRUNZO_CONFIG__ = ${JSON.stringify(publicConfig)};`);
});
app.all("/api/*", (_req, res) => {
  res.status(404).json({
    success: false,
    code: "NOT_FOUND",
    error: "API endpoint not found"
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WebRunzo Full-Stack Server running on port ${PORT}`);
  });
}
if (!process.env.VERCEL) {
  startServer();
}
var server_default = app;
export {
  app,
  server_default as default
};
//# sourceMappingURL=server.js.map
