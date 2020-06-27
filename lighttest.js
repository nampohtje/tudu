const Lookup = require("node-yeelight-wifi").Lookup;

let look = new Lookup();

look.on("detected",(light) =>
{
    console.log("new yeelight detected: id="+light.id + " name="+light.name);

    //socket connect and disconnect events
    light.on("connected",() =>{ console.log("connected"); });
    light.on("disconnected",() => { console.log("disconnected"); });
    
    //if the color or power state has changed
    light.on("stateUpdate",(light) => { console.log(light); });
    
    //if something went wrong
    light.on("failed",(error) => { console.log(error); });

    light.setBright(80, 2000).then(() =>
    {
        console.log("success");
    }).catch((error =>
    {
        console.log("failed",error);
    }));
    
});
