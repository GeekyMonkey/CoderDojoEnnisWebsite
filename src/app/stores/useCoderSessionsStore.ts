import {useMemberSessionsStore} from "./useMemberSessionsStore";
/** Preserve the coder facade over the shared role-scoped session store. */
export function useCoderSessionsStore():ReturnType<typeof useMemberSessionsStore>{return useMemberSessionsStore("Coder");}
