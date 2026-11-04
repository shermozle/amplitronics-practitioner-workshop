// Development convenience only. Production is plain static files on GitHub Pages.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.md':'text/plain','.csv':'text/csv','.json':'application/json'};
createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const resolved=path.resolve(root,`.${decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname)}`);if(!resolved.startsWith(root+path.sep)){res.writeHead(403).end();return;}const body=await readFile(resolved);res.writeHead(200,{'Content-Type':types[path.extname(resolved)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);}catch{res.writeHead(404).end('Not found');}}).listen(4173,'127.0.0.1',()=>console.log('Amplitronics: http://127.0.0.1:4173'));
