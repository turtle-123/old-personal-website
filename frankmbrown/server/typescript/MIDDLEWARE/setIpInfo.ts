import { Request, Response, NextFunction } from 'express';
import net from 'node:net';
import IS_DEVELOPMENT from '../CONSTANTS/IS_DEVELOPMENT';
function generateRandomIP() {
  let ip = "";
  for (let i = 0; i < 4; i++) {
    ip += Math.floor(Math.random() * 256) + ".";
  }
  return ip.slice(0, -1); // Remove the trailing dot
}

/**
 * If unable to get ip address, set address as null in Session Cache, 
 * Then Send appropriate page back to user
 * Else, set IP address in Session Cache and continue
 * 
 * [Reference](https://www.npmjs.com/package/request-ip) for .clientIp
 * 
 * @param req Request
 */
function setIpInfo(req: Request,res:Response,next:NextFunction) {
  if (IS_DEVELOPMENT&&!!!req.session.ip) {
    const ip = generateRandomIP(); // See 
    const type = net.isIP(String(ip)) as 0|4|6;
    if (ip===undefined) req.session.ip = { address: null, type: 0 };
    else req.session.ip = { address: String(ip), type };
  } else if (!!!req.session.ip) {
    const ip = req.clientIp; // See 
    const type = net.isIP(String(ip)) as 0|4|6;
    if (ip===undefined) req.session.ip = { address: null, type: 0 };
    else req.session.ip = { address: String(ip), type };
  }
  next();
}
export default setIpInfo;