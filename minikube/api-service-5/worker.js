addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Fetch and log a given request object
 * @param {Request} request
 */
async function handleRequest(request) {
  try{
    let cache = KeyValueStore;

    const user_id = request.headers.get("user_id");
    const user_token = request.headers.get("user_token");
    const delete_token = request.headers.get("user_end_session");

    if(user_id){
      const token = await cache.get(user_id);

      let cached = false;
      let fromCache = false;
      if(!token && user_token && user_token != "none"){
        try{
          await cache.put(user_id, user_token);
        }catch(e){}
        cached = true;
      }else{
        fromCache = true;
        if(delete_token && delete_token == "true"){
          try{
            await cache.delete(user_id);
          }catch(e){}
          fromCache = false;
          cached = false;
        }
      }

    return new Response(JSON.stringify({token:token || user_token, cached: cached, fromCache: fromCache}));
    }

    return new Response(JSON.stringify({error:"No user passed in!"}));
  }catch(e){
    return new Response(JSON.stringify({error:e.message}));
  }
}