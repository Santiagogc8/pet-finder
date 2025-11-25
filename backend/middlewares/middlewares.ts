import { Request, Response, NextFunction } from "express"; // Importaciones para el middleware

// Creamos un middleWare para obtener el authorization del header. Recibe el req, el res y la funcion next
function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const headerAuth = req.get("Authorization"); // Obtenemos el header Authorization

    // Si no se recibio, tiramos error
    if (!headerAuth) return res.status(401).json({ error: "not token provided" });

    // Partimos el token cuando haya un espacio y accedemos a la posicion 1 del array devuelto
    const token = headerAuth.split(" ")[1];
    if (!token) return res.status(401).json({ error: "token malformed" }); // Si el token es algo raro, tiramos error

    req.token = token; // Guardamos el token en req.token
    next(); // Continuamos el flujo
}

function validateUser(req: Request, res: Response, next: NextFunction){
    const headerAuth = req.get("Authorization"); // Obtenemos el header Authorization

    // Si no se recibio, devolvemos not logued
    if (!headerAuth){
        req.token = null;
        return next();
    }

    // Partimos el token cuando haya un espacio y accedemos a la posicion 1 del array devuelto
    const token = headerAuth.split(" ")[1];
    if (!token) return res.status(401).json({ error: "token malformed" }); // Si el token es algo raro, tiramos error

    req.token = token; // Guardamos el token en req.token
    next(); // Continuamos el flujo
}

export { authMiddleware, validateUser }