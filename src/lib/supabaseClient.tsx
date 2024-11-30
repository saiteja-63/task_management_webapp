/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from '@supabase/supabase-js'
import { User } from '../types/user'
import { stringify } from 'qs-esm'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function ensureUserInPayload(user: User) {
  // First check if user exists in Supabase
  const { data: supabaseUser, error: supabaseError } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email)
    .single()

  if (supabaseError && supabaseError.code !== 'PGRST116') {
    throw supabaseError;
  }

  try {
    // Check if user exists in Payload
    const query = {
      email: {
        equals: user.email
      }
    }
    
    const stringifiedQuery = stringify(
      { where: query },
      { addQueryPrefix: true }
    )
    
    const findResponse = await fetch(`/api/users${stringifiedQuery}`, {
      method: "GET",
      credentials: "include",
    });
    const findData = await findResponse.json();

    // If user exists in Payload, return it
    if (findData.docs && findData.docs.length > 0) {
      return findData.docs[0];
    }

    // Only create user if they don't exist in Payload
    const createUserResponse = await fetch(`/api/users`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        supabaseId: user.supabaseId,
        password: 'admin'
      }),
    });

    if (!createUserResponse.ok) {
      throw new Error(`Failed to create user in Payload CMS: ${await createUserResponse.text()}`);
    }

    return await createUserResponse.json();
  } catch (error) {
    console.error('Error syncing user with Payload:', error);
    throw error;
  }
}