import mongoose from 'mongoose';
import { EmailTemplate, IEmailTemplate, TemplateCategory } from '../models/EmailTemplate';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface TemplateFilterOptions {
  category?: string;
  search?: string;
  favorite?: boolean;
}

function extractPlaceholders(text: string): string[] {
  const matches = text.match(/{{\s*([a-zA-Z0-9_-]+)\s*}}/g) || [];
  const clean = matches.map((m) => m.replace(/[{}]/g, '').trim());
  return Array.from(new Set(clean));
}

const DEFAULT_TEMPLATES = [
  {
    name: 'Model United Nations (MUN) Sponsorship Proposal',
    subject: 'Partnership & Sponsorship Proposal: {{conference_name}} {{year}}',
    bodyText: `Dear {{recipient_name}},\n\nI hope this email finds you well.\n\nI am writing to you on behalf of the {{organization_name}} secretariat to explore a mutually beneficial sponsorship and partnership opportunity for our upcoming conference, {{conference_name}}.\n\nOur event convenes over {{expected_delegates}} ambitious student delegates, emerging leaders, and academic peers from across the region. With your esteemed support, we aim to deliver an impactful platform for diplomatic discourse while offering {{company_name}} extensive brand visibility across our delegate materials, conference banners, opening ceremonies, and digital platforms.\n\nWe would be thrilled to share our comprehensive sponsorship brochure and discuss custom partnership tiers at your convenience.\n\nThank you for your time and consideration. We look forward to the possibility of collaborating with you.\n\nWarm regards,\n{{sender_name}}\n{{sender_title}} | {{organization_name}}`,
    category: 'sponsorship' as TemplateCategory,
    isFavorite: true,
  },
  {
    name: 'Strategic Partnership Outreach',
    subject: 'Exploring Strategic Collaboration: {{company_a}} & {{company_b}}',
    bodyText: `Hi {{recipient_name}},\n\nI have been following {{company_b}}'s impressive work in {{industry_field}}, especially your recent updates on {{recent_initiative}}.\n\nAt {{company_a}}, we are currently developing solutions for {{value_proposition}}. Given our shared focus, I believe there is strong potential for a mutually beneficial collaboration between our teams.\n\nWould you be open to a brief 15-minute introductory call next week to explore potential synergies?\n\nBest regards,\n{{sender_name}}\n{{sender_title}}`,
    category: 'outreach' as TemplateCategory,
    isFavorite: true,
  },
  {
    name: 'Polite Follow-up on Proposal',
    subject: 'Following up: {{original_subject}}',
    bodyText: `Hi {{recipient_name}},\n\nI hope you are having a productive week.\n\nI wanted to gently follow up on my previous email regarding {{topic_summary}}. We are eager to move forward with the next steps and would love to hear your thoughts or answer any questions you may have.\n\nPlease let me know if you need any additional details or if there is a convenient time for a quick check-in.\n\nThank you for your time,\n{{sender_name}}`,
    category: 'follow_up' as TemplateCategory,
    isFavorite: false,
  },
  {
    name: 'Meeting Request & Alignment',
    subject: 'Meeting Request: {{meeting_topic}} alignment',
    bodyText: `Dear {{recipient_name}},\n\nI would like to schedule a brief meeting to discuss {{meeting_topic}} and align on key deliverables and milestones.\n\nPlease let me know your availability for a 20-minute call during any of the following time slots:\n- {{time_option_1}}\n- {{time_option_2}}\n\nLooking forward to speaking with you.\n\nBest regards,\n{{sender_name}}`,
    category: 'meeting' as TemplateCategory,
    isFavorite: false,
  },
];

export const templateService = {
  /**
   * Retrieves email templates with auto-seeding for new users
   */
  async listTemplates(userId: string, options: TemplateFilterOptions = {}): Promise<IEmailTemplate[]> {
    const ownerId = new mongoose.Types.ObjectId(userId);

    // Auto-seed default starter templates if user has none
    const count = await EmailTemplate.countDocuments({ owner: ownerId });
    if (count === 0) {
      await Promise.all(
        DEFAULT_TEMPLATES.map((tmpl) =>
          EmailTemplate.create({
            owner: ownerId,
            name: tmpl.name,
            subject: tmpl.subject,
            bodyText: tmpl.bodyText,
            category: tmpl.category,
            placeholders: extractPlaceholders(`${tmpl.subject} ${tmpl.bodyText}`),
            isFavorite: tmpl.isFavorite,
            usageCount: 0,
          })
        )
      );
    }

    const filter: Record<string, any> = { owner: ownerId };

    if (options.category && options.category !== 'all') {
      filter.category = options.category;
    }

    if (options.favorite) {
      filter.isFavorite = true;
    }

    if (options.search) {
      filter.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { subject: { $regex: options.search, $options: 'i' } },
        { bodyText: { $regex: options.search, $options: 'i' } },
      ];
    }

    return EmailTemplate.find(filter).sort({ isFavorite: -1, usageCount: -1, createdAt: -1 }).lean() as any;
  },

  /**
   * Retrieves single template by ID
   */
  async getTemplateById(userId: string, templateId: string): Promise<IEmailTemplate> {
    if (!mongoose.isValidObjectId(templateId)) {
      throw createError('Invalid template ID format.', 400, 'INVALID_TEMPLATE_ID');
    }

    const template = await EmailTemplate.findOne({
      _id: new mongoose.Types.ObjectId(templateId),
      owner: new mongoose.Types.ObjectId(userId),
    });

    if (!template) {
      throw createError('Email template not found.', 404, 'TEMPLATE_NOT_FOUND');
    }

    return template;
  },

  /**
   * Creates a new email template
   */
  async createTemplate(
    userId: string,
    payload: {
      name: string;
      subject: string;
      bodyText: string;
      bodyHtml?: string;
      category?: TemplateCategory;
      isFavorite?: boolean;
    }
  ): Promise<IEmailTemplate> {
    if (!payload.name?.trim() || !payload.subject?.trim() || !payload.bodyText?.trim()) {
      throw createError('Name, subject, and body text are required.', 400, 'INVALID_TEMPLATE_DATA');
    }

    const combinedText = `${payload.subject} ${payload.bodyText}`;
    const placeholders = extractPlaceholders(combinedText);

    const template = await EmailTemplate.create({
      owner: new mongoose.Types.ObjectId(userId),
      name: payload.name.trim(),
      subject: payload.subject.trim(),
      bodyText: payload.bodyText.trim(),
      bodyHtml: payload.bodyHtml || '',
      category: payload.category || 'general',
      placeholders,
      isFavorite: !!payload.isFavorite,
      usageCount: 0,
    });

    logger.info('Email template created', { userId, templateId: template._id.toString() });
    return template;
  },

  /**
   * Updates an existing template
   */
  async updateTemplate(
    userId: string,
    templateId: string,
    updates: Partial<{
      name: string;
      subject: string;
      bodyText: string;
      bodyHtml: string;
      category: TemplateCategory;
      isFavorite: boolean;
    }>
  ): Promise<IEmailTemplate> {
    if (!mongoose.isValidObjectId(templateId)) {
      throw createError('Invalid template ID format.', 400, 'INVALID_TEMPLATE_ID');
    }

    const template = await EmailTemplate.findOne({
      _id: new mongoose.Types.ObjectId(templateId),
      owner: new mongoose.Types.ObjectId(userId),
    });

    if (!template) {
      throw createError('Email template not found.', 404, 'TEMPLATE_NOT_FOUND');
    }

    if (updates.name !== undefined) template.name = updates.name.trim();
    if (updates.subject !== undefined) template.subject = updates.subject.trim();
    if (updates.bodyText !== undefined) template.bodyText = updates.bodyText.trim();
    if (updates.bodyHtml !== undefined) template.bodyHtml = updates.bodyHtml;
    if (updates.category !== undefined) template.category = updates.category;
    if (updates.isFavorite !== undefined) template.isFavorite = updates.isFavorite;

    template.placeholders = extractPlaceholders(`${template.subject} ${template.bodyText}`);

    await template.save();
    return template;
  },

  /**
   * Deletes an email template
   */
  async deleteTemplate(userId: string, templateId: string): Promise<void> {
    if (!mongoose.isValidObjectId(templateId)) {
      throw createError('Invalid template ID format.', 400, 'INVALID_TEMPLATE_ID');
    }

    const result = await EmailTemplate.deleteOne({
      _id: new mongoose.Types.ObjectId(templateId),
      owner: new mongoose.Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw createError('Email template not found.', 404, 'TEMPLATE_NOT_FOUND');
    }
  },

  /**
   * Increments the template usage counter
   */
  async incrementUsage(userId: string, templateId: string): Promise<IEmailTemplate> {
    if (!mongoose.isValidObjectId(templateId)) {
      throw createError('Invalid template ID format.', 400, 'INVALID_TEMPLATE_ID');
    }

    const template = await EmailTemplate.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(templateId),
        owner: new mongoose.Types.ObjectId(userId),
      },
      { $inc: { usageCount: 1 } },
      { new: true }
    );

    if (!template) {
      throw createError('Email template not found.', 404, 'TEMPLATE_NOT_FOUND');
    }

    return template;
  },

  /**
   * Interpolates template placeholders with provided variable dictionary
   */
  interpolateVariables(text: string, variables: Record<string, string> = {}): string {
    if (!text) return '';
    return text.replace(/{{\s*([a-zA-Z0-9_-]+)\s*}}/g, (_match, key) => {
      return variables[key] !== undefined ? variables[key] : `{{${key}}}`;
    });
  },
};
