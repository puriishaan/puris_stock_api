export default defineEventHandler((event) => {
    const authorizationHeader = event.headers.get("Authorization");
  
    if (!authorizationHeader) {
      setResponseStatus(event, 401);
      return { error: "No authorization header provided." };
    }
  });
  