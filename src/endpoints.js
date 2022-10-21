import { URL } from "node:url";

const normalize = (portal) => {
  if (!portal.startsWith("https://")) {
    portal = `https://${portal}`;
  }
  const url = new URL(portal);

  if (url.hostname.startsWith("account.")) {
    url.hostname = url.hostname.replace("account.", "");
  }

  return url.toString();
};

export function getPortalApi(portal) {
  return normalize(portal);
}

export function getAccountApi(portal) {
  const url = new URL(normalize(portal));
  url.hostname = `account.${url.hostname}`;
  return url.toString();
}

export function getAccountAuthApi(portal) {
  const url = new URL(getAccountApi(portal));
  url.pathname = "/api/login";
  return url.toString();
}

export function getAccountUploadsApi(portal, pageSize = 100000, offset = 0) {
  const url = new URL(getAccountApi(portal));
  url.pathname = "/api/user/uploads";
  url.searchParams.set("pageSize", pageSize);
  url.searchParams.set("offset", offset);
  return url.toString();
}

export function getSkylinkPinEndpoint(portal, skylink) {
  const url = new URL(getPortalApi(portal));
  url.pathname = `/skynet/pin/${skylink}`;
  return url.toString();
}

export function getSkylinkHealthEndpoint(portal, skylink) {
  const url = new URL(getPortalApi(portal));
  url.pathname = `/skynet/health/skylink/${skylink}`;
  return url.toString();
}
