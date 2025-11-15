import { User } from "./user";
import { Report } from "./report";
import { Pet } from "./pet";

User.hasMany(Pet); // Un user puede tener muchas mascotas
Pet.belongsTo(User); // Una mascota pertenece a un solo usuario

Pet.hasMany(Report); // Una mascota puede tener muchos reportes
Report.belongsTo(Pet); // Un reporte pertenece a una sola mascota

export { User, Report, Pet }