import { boot } from '../shell.js';
import { mountRegister } from '../components/record.js';

boot();
mountRegister(document.getElementById('register'));
