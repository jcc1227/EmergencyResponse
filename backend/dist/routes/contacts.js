"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_js_1 = require("../models/index.js");
const router = (0, express_1.Router)();
// Get user contacts
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        // Return contacts from the dedicated Contact collection
        const contacts = await index_js_1.Contact.find({ userId }).sort({ createdAt: -1 }).lean();
        res.json({ contacts: contacts || [] });
    }
    catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Add a contact
router.post('/:userId', async (req, res) => {
    try {
        const { name, phone, isPrimary, relationship } = req.body;
        const userId = req.params.userId;
        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and phone are required' });
        }
        // Ensure user exists
        const user = await index_js_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // If primary, unset other primary contacts for this user
        if (isPrimary) {
            await index_js_1.Contact.updateMany({ userId }, { $set: { isPrimary: false } });
        }
        const created = await index_js_1.Contact.create({ userId, name, phone, isPrimary: !!isPrimary, relationship });
        const contacts = await index_js_1.Contact.find({ userId }).sort({ createdAt: -1 }).lean();
        res.status(201).json({ message: 'Contact added successfully', contacts });
    }
    catch (error) {
        console.error('Add contact error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update a contact
router.patch('/:userId/:contactId', async (req, res) => {
    try {
        const { name, phone, isPrimary, relationship } = req.body;
        const { userId, contactId } = req.params;
        // Ensure contact exists and belongs to user
        const contact = await index_js_1.Contact.findOne({ _id: contactId, userId });
        if (!contact)
            return res.status(404).json({ error: 'Contact not found' });
        if (isPrimary) {
            await index_js_1.Contact.updateMany({ userId }, { $set: { isPrimary: false } });
        }
        if (name !== undefined)
            contact.name = name;
        if (phone !== undefined)
            contact.phone = phone;
        if (relationship !== undefined)
            contact.relationship = relationship;
        if (isPrimary !== undefined)
            contact.isPrimary = !!isPrimary;
        await contact.save();
        const contacts = await index_js_1.Contact.find({ userId }).sort({ createdAt: -1 }).lean();
        res.json({ message: 'Contact updated successfully', contacts });
    }
    catch (error) {
        console.error('Update contact error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete a contact
router.delete('/:userId/:contactId', async (req, res) => {
    try {
        const { userId, contactId } = req.params;
        const contact = await index_js_1.Contact.findOne({ _id: contactId, userId });
        if (!contact)
            return res.status(404).json({ error: 'Contact not found' });
        await index_js_1.Contact.deleteOne({ _id: contactId });
        const contacts = await index_js_1.Contact.find({ userId }).sort({ createdAt: -1 }).lean();
        res.json({ message: 'Contact deleted successfully', contacts });
    }
    catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
