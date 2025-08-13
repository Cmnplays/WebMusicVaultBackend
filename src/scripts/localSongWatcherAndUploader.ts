//this file is a script for watching songs folder in your local maching and upload it to the server/site.

import axios from "axios";
import chokidar from "chokidar";
import { env } from "../config/env";
