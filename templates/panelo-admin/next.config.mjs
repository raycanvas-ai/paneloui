/** @type {import("next").NextConfig} */
export default {
  reactCompiler: true,
  // Production bundles ship without console.* calls; development keeps them.
  compiler: { removeConsole: process.env.NODE_ENV === "production" },
  // /dashboard has no page of its own, so send it to the overview (temporary, so it can change later).
  redirects: async () => [{ source: "/dashboard", destination: "/dashboard/default", permanent: false }],
};
