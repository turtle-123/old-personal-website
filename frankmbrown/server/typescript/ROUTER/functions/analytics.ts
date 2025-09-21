import { Request, Response } from 'express';
import getDatabase from '../../database';
import * as TIME from '../../utils/time';
type CspReport = {
  "blocked-uri": string,
  "disposition": string,
  "document-uri": string,
  "effective-directive": string,
  "original-policy": string,
  "referrer": string,
  "script-sample": string,
  "status-code": string,
  "violated-directive": string
};
const stringOrNull = (val: any) => {
  if (typeof val === 'string') return val;
  else return null;
}
async function handleCspViolation(req:Request,res:Response){
  try {
    const query = `INSERT INTO csp_violations (
      ip_id,
      unix_time,
      blocked_uri,
      disposition,
      document_uri,
      effective_directive,
      original_policy,
      referrer,
      script_sample,
      status_code,
      violated_directive
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      $11
    );`;
    const ip_id = Number(req?.session?.ip_id) || null;
    const unix_time = TIME.getUnixTime();
    const cspReport = req.body["csp-report"] as CspReport;
    const blockedURI = stringOrNull(cspReport['blocked-uri']);
    const disposition = stringOrNull(cspReport['disposition']);
    const documentUri = stringOrNull(cspReport['document-uri']);
    const effectiveDirective= stringOrNull(cspReport['effective-directive']);
    const originalPolicy= stringOrNull(cspReport['original-policy']);
    const referrer = stringOrNull(cspReport['referrer']);
    const scriptSample=stringOrNull(cspReport['script-sample']);
    const statusCode= stringOrNull(cspReport['status-code']);
    const violatedDirective = stringOrNull(cspReport['violated-directive']);
    const arr = [
      ip_id,
      unix_time,
      blockedURI,
      disposition,
      documentUri,
      effectiveDirective,
      originalPolicy,
      referrer,
      scriptSample,
      statusCode,
      violatedDirective
    ];
    await getDatabase().query(query,arr);
  } catch (error) {
    console.error(error);
  }
  return res.sendStatus(200);
}
export {
  handleCspViolation
};