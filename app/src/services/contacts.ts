import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config/api';

export interface ContactRecord {
  id?: string;
  name: string;
  phone: string;
  isPrimary?: boolean;
  relationship?: string;
}

const CONTACTS_KEY = 'contacts';

export async function loadContactsLocal(): Promise<ContactRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(CONTACTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ContactRecord[];
  } catch (err) {
    console.error('contacts.loadContactsLocal error', err);
    return [];
  }
}

export async function saveContactsLocal(contacts: ContactRecord[]) {
  try {
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  } catch (err) {
    console.error('contacts.saveContactsLocal error', err);
  }
}

export async function syncContactsFromServer(userId: string): Promise<ContactRecord[] | null> {
  if (!userId) return null;
  try {
    const res = await fetch(`${API_URL}/contacts/${userId}`);
    if (!res.ok) return null;
    const data = await res.json();
    const contacts = (data.contacts || []) as ContactRecord[];
    await saveContactsLocal(contacts);
    return contacts;
  } catch (err) {
    console.error('contacts.syncContactsFromServer error', err);
    return null;
  }
}

export async function addContact(contact: ContactRecord, userId?: string): Promise<ContactRecord[]> {
  // Save locally first
  const local = await loadContactsLocal();
  const newContacts = [...local, contact];
  await saveContactsLocal(newContacts);

  // Try add to server if userId provided
  if (userId) {
    try {
      const res = await fetch(`${API_URL}/contacts/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contact.name, phone: contact.phone, isPrimary: contact.isPrimary, relationship: contact.relationship }),
      });
      if (res.ok) {
        const body = await res.json();
        if (body.contacts) {
          await saveContactsLocal(body.contacts);
          return body.contacts;
        }
      }
    } catch (err) {
      console.error('contacts.addContact remote error', err);
    }
  }

  return newContacts;
}

export async function updateContact(contactId: string, updates: Partial<ContactRecord>, userId?: string): Promise<ContactRecord[]> {
  const local = await loadContactsLocal();
  const idx = local.findIndex(c => c.id === contactId || (c as any)._id === contactId);
  if (idx === -1) return local;
  const updated = { ...local[idx], ...updates } as ContactRecord;
  const newContacts = [...local];
  newContacts[idx] = updated;
  await saveContactsLocal(newContacts);

  if (userId) {
    try {
      const res = await fetch(`${API_URL}/contacts/${userId}/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: updated.name, phone: updated.phone, isPrimary: updated.isPrimary, relationship: updated.relationship }),
      });
      if (res.ok) {
        const body = await res.json();
        if (body.contacts) {
          await saveContactsLocal(body.contacts);
          return body.contacts as ContactRecord[];
        }
      }
    } catch (err) {
      console.error('contacts.updateContact remote error', err);
    }
  }

  return newContacts;
}

export async function deleteContact(contactId: string, userId?: string): Promise<ContactRecord[]> {
  const local = await loadContactsLocal();
  const newContacts = local.filter(c => !(c.id === contactId || (c as any)._id === contactId));
  await saveContactsLocal(newContacts);

  if (userId) {
    try {
      const res = await fetch(`${API_URL}/contacts/${userId}/${contactId}`, { method: 'DELETE' });
      if (res.ok) {
        const body = await res.json();
        if (body.contacts) {
          await saveContactsLocal(body.contacts);
          return body.contacts as ContactRecord[];
        }
      }
    } catch (err) {
      console.error('contacts.deleteContact remote error', err);
    }
  }

  return newContacts;
}
