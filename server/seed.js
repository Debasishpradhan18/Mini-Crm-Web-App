const { dbAsync } = require('./db');

async function seedUserCRMData(userId) {
  // Check if user already has contacts
  const count = await dbAsync.get('SELECT COUNT(id) as count FROM contacts WHERE user_id = ?', [userId]);
  if (count && count.count > 0) {
    return; // Already has data
  }

  console.log(`Seeding initial CRM demo data for user ${userId}...`);

  // 1. Create Contacts
  const contactsData = [
    {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@cloudscale.io',
      phone: '+1 (415) 890-2341',
      company: 'CloudScale Dynamics',
      job_title: 'Chief Technology Officer',
      status: 'Lead',
      tags: JSON.stringify(['Enterprise', 'Hot Lead', 'Cloud']),
      value: 48000,
      notes: 'Expressed strong interest during webinar. Wants to integrate our CRM API with their Kubernetes microservices. Requested SOC2 compliance report.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'David Chen',
      email: 'david.chen@nexalogistics.com',
      phone: '+1 (312) 555-0199',
      company: 'Nexa Logistics',
      job_title: 'VP of Operations',
      status: 'Prospect',
      tags: JSON.stringify(['Mid-Market', 'Demo Scheduled', 'Logistics']),
      value: 24500,
      notes: 'Looking for a CRM to replace their aging legacy spreadsheet workflow. 45 field agents need mobile and Kanban access. Met at TechExpo Chicago.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'Elena Rostova',
      email: 'elena.rostova@finpulse.de',
      phone: '+49 30 901820',
      company: 'FinPulse Capital',
      job_title: 'Head of Growth',
      status: 'Customer',
      tags: JSON.stringify(['Fintech', 'VIP Customer', 'Europe']),
      value: 65000,
      notes: 'Onboarded last quarter. Expanded team from 10 to 50 seats. Very satisfied with AI automated follow-up drafts. Potential case study candidate.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'Marcus Sterling',
      email: 'm.sterling@apexcap.com',
      phone: '+1 (212) 789-4400',
      company: 'Apex Global Capital',
      job_title: 'Managing Director',
      status: 'Customer',
      tags: JSON.stringify(['Finance', 'Decision Maker', 'High Value']),
      value: 92000,
      notes: 'Deal closed last month! Successfully deployed full pipeline automation across their private equity analyst desk.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@omnihealth.org',
      phone: '+1 (650) 412-8877',
      company: 'OmniHealth AI',
      job_title: 'Director of Partnerships',
      status: 'Prospect',
      tags: JSON.stringify(['Healthcare', 'HIPAA', 'Q4 Review']),
      value: 36000,
      notes: 'Requested security whitepaper on data retention. Need approval from legal committee before signing contract.',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'James Wilson',
      email: 'james@horizonstudio.co',
      phone: '+44 20 7946 0912',
      company: 'Horizon Creative Studio',
      job_title: 'Founder & CEO',
      status: 'Inactive',
      tags: JSON.stringify(['SMB', 'Design Agency']),
      value: 6200,
      notes: 'Postponed CRM upgrade to next fiscal year due to internal agency restructuring. Check back in 6 months.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  ];

  const contactIds = [];

  for (const c of contactsData) {
    const res = await dbAsync.run(
      `INSERT INTO contacts (user_id, name, email, phone, company, job_title, status, tags, value, notes, avatar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, c.name, c.email, c.phone, c.company, c.job_title, c.status, c.tags, c.value, c.notes, c.avatar]
    );
    contactIds.push({ id: res.lastID, ...c });
  }

  // 2. Create Deals across Kanban stages
  const dealsData = [
    {
      contact_id: contactIds[0].id,
      title: 'CloudScale Enterprise Cloud Migration',
      value: 48000,
      stage: 'New',
      probability: 20,
      priority: 'High',
      expected_close_date: '2026-11-15',
      notes: 'Initial inquiry for 100 enterprise licenses + custom API integration.'
    },
    {
      contact_id: contactIds[1].id,
      title: 'Nexa Fleet Operations Hub',
      value: 24500,
      stage: 'Contacted',
      probability: 45,
      priority: 'Medium',
      expected_close_date: '2026-10-30',
      notes: 'Demo completed with VP of Ops. Follow-up meeting scheduled with IT lead.'
    },
    {
      contact_id: contactIds[4].id,
      title: 'OmniHealth AI Platform Rollout',
      value: 36000,
      stage: 'Qualified',
      probability: 75,
      priority: 'High',
      expected_close_date: '2026-10-20',
      notes: 'Legal approved DPA. Final pricing proposal under review by executive board.'
    },
    {
      contact_id: contactIds[3].id,
      title: 'Apex Capital Global Portal',
      value: 92000,
      stage: 'Won',
      probability: 100,
      priority: 'High',
      expected_close_date: '2026-09-10',
      notes: 'Multi-year enterprise contract executed. Payment received.'
    },
    {
      contact_id: contactIds[2].id,
      title: 'FinPulse 50-Seat Tier Upgrade',
      value: 28000,
      stage: 'Won',
      probability: 100,
      priority: 'Medium',
      expected_close_date: '2026-08-25',
      notes: 'Upgraded team subscription to Enterprise Tier with custom analytics.'
    },
    {
      contact_id: contactIds[5].id,
      title: 'Horizon Studio Team Subscription',
      value: 6200,
      stage: 'Lost',
      probability: 0,
      priority: 'Low',
      expected_close_date: '2026-07-15',
      notes: 'Budget postponed to next year.'
    }
  ];

  const dealIds = [];
  for (const d of dealsData) {
    const res = await dbAsync.run(
      `INSERT INTO deals (user_id, contact_id, title, value, stage, probability, priority, expected_close_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, d.contact_id, d.title, d.value, d.stage, d.probability, d.priority, d.expected_close_date, d.notes]
    );
    dealIds.push({ id: res.lastID, ...d });
  }

  // 3. Create realistic timeline activities
  const activitiesData = [
    {
      contact_id: contactIds[3].id,
      deal_id: dealIds[3].id,
      type: 'stage_change',
      title: 'Deal Won & Closed',
      description: 'Closed Apex Capital deal for $92,000! Contract signed by Marcus Sterling.'
    },
    {
      contact_id: contactIds[4].id,
      deal_id: dealIds[2].id,
      type: 'email',
      title: 'Sent Proposal & Security Whitepaper',
      description: 'Dispatched custom proposal package with HIPAA compliance documentation.'
    },
    {
      contact_id: contactIds[0].id,
      deal_id: dealIds[0].id,
      type: 'ai_assist',
      title: 'AI Follow-up Email Drafted',
      description: 'Generated tailored discovery follow-up highlighting Kubernetes API integrations.'
    },
    {
      contact_id: contactIds[1].id,
      deal_id: dealIds[1].id,
      type: 'call',
      title: 'Product Walkthrough Call',
      description: '35-minute video sync showing Kanban deal tracking and real-time contact timeline.'
    },
    {
      contact_id: contactIds[2].id,
      deal_id: dealIds[4].id,
      type: 'note',
      title: 'Customer Quarterly Check-in',
      description: 'Elena confirmed adoption rate is over 95% among their European analyst team.'
    }
  ];

  for (const a of activitiesData) {
    await dbAsync.run(
      `INSERT INTO activities (user_id, contact_id, deal_id, type, title, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, a.contact_id, a.deal_id, a.type, a.title, a.description]
    );
  }

  console.log(`Demo CRM data seeded successfully for user ${userId}.`);
}

module.exports = {
  seedUserCRMData
};
