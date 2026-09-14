export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

const STORAGE_KEY = 'crisisweave_user_contacts';

export const getUserContacts = (): EmergencyContact[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load contacts:', e);
    return [];
  }
};

export const addUserContact = (contact: Omit<EmergencyContact, 'id'>): EmergencyContact => {
  const existing = getUserContacts();
  const newContact: EmergencyContact = {
    id: 'contact-' + Date.now(),
    name: contact.name,
    phone: contact.phone,
    relation: contact.relation || 'Family / Friend'
  };

  const updated = [...existing, newContact];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save contact:', e);
  }
  return newContact;
};

export const deleteUserContact = (id: string): void => {
  const existing = getUserContacts();
  const updated = existing.filter(c => c.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete contact:', e);
  }
};
