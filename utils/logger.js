  
const rTracer = require("cls-rtracer");

const printId = () => {
   const id = rTracer.id();
   return id ? `[${id}]` : "";
};

module.exports = {
   error: (...msg) => console.error(`[ ERROR ]${printId()}`, ...msg),
   info: (...msg) => console.info(`[ INFO  ]${printId()}`, ...msg)
};