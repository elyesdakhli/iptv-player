import {createContext} from "react";
import {Source} from "../types/Types.ts";

export const SourceContext = createContext<Source | null>(null);


