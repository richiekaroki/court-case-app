import {Sequelize} from 'sequelize';
import Config from '../config/Config.js';

const sequelize = new Sequelize(Config.database);

export default sequelize;

