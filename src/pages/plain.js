import { boot } from '../shell.js';
import { mountFooterMark } from '../components/brand.js';

boot();
const nf = document.getElementById('nf-line');
if (nf) mountFooterMark(nf);
