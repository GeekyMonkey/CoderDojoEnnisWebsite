import mitt, { type Emitter } from 'mitt'
import { UseSupabaseClient } from './UseSupabaseClient'
import type { RealtimeChannel } from '@supabase/supabase-js'

type AllTableDbEventTypes = 'INSERT' | 'UPDATE' | 'DELETE'
export type AllTablesDbEvents = {
  INSERT: { table: string; id: string; newData: any }
  UPDATE: { table: string; id: string; newData: any; oldData: any }
  DELETE: { table: string; id: string }
}

let allTablesChannel: RealtimeChannel | null = null
let allTablesEmitter: Emitter<AllTablesDbEvents> | null = null

/**
 * Subscribe once to ALL tables in the `coderdojo` schema. Requires the Supabase
 * Realtime publication to include the desired tables (see SQL note below).
 */
export function UseSupabaseRealtimeAllTables() {
  const { supabaseClient } = UseSupabaseClient()
  if (allTablesChannel && allTablesEmitter) {
    return { channel: allTablesChannel, events: allTablesEmitter }
  }

  console.log('[UseSupabaseClient] Subscribing to changes in ALL coderdojo tables')
  allTablesEmitter = mitt<AllTablesDbEvents>()

  // Wildcard subscription: omit `table` to receive events for every table in the schema
  allTablesChannel = supabaseClient
    .channel('coderdojo:all')
    .on(
      'postgres_changes',
      { event: '*', schema: 'coderdojo' },
      (payload) => {
        const { eventType, table, new: newData, old: oldData } = payload as any
        const id = (newData?.id) || (oldData?.id)
        if (!id) return
        const base = { table, id }
        if (eventType === 'INSERT') {
          allTablesEmitter!.emit('INSERT', { ...base, newData })
        } else if (eventType === 'UPDATE') {
          allTablesEmitter!.emit('UPDATE', { ...base, newData, oldData })
        } else if (eventType === 'DELETE') {
          allTablesEmitter!.emit('DELETE', base)
        }
      }
    )
    .subscribe()

  return { channel: allTablesChannel, events: allTablesEmitter }
}

/**
 * SQL (run once in Supabase) to ensure all coderdojo schema tables are in the realtime publication:
 *   -- Create or extend a publication which Supabase Realtime uses
 *   create publication coderdojo_realtime for all tables in schema coderdojo;
 *   -- OR add specific tables (example):
 *   alter publication supabase_realtime add table coderdojo.teams, coderdojo.members;
 *
 * After adding new tables later, run another ALTER PUBLICATION ... ADD TABLE statement
 * or switch to the `for all tables in schema` form.
 */