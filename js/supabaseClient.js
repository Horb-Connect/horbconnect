import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://dcdxhtjltzkxhpvcjvmp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZHhodGpsdHpreGhwdmNqdm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MTY3NzgsImV4cCI6MjA2MDk5Mjc3OH0.uDdhqc81-EZaJ3bDcQLnvGAktQ0fsjh519zipWoeIZE'

export const supabase = createClient(supabaseUrl, supabaseKey) 