const https = require('https');

/**
 * Helper to make HTTPS requests without external fat libraries
 */
function makeHttpsRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error?.message || `HTTP ${res.statusCode}: ${body}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

/**
 * Call Google Gemini API (v1beta or v1)
 */
async function callGemini(apiKey, systemPrompt, userPrompt) {
  const postData = JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemPrompt}\n\nTask:\n${userPrompt}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000
    }
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const response = await makeHttpsRequest(options, postData);
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response text received from Gemini');
  return text.trim();
}

/**
 * Call OpenAI API
 */
async function callOpenAI(apiKey, systemPrompt, userPrompt) {
  const postData = JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const response = await makeHttpsRequest(options, postData);
  const text = response.choices?.[0]?.message?.content;
  if (!text) throw new Error('No response text received from OpenAI');
  return text.trim();
}

/**
 * Smart Local AI Engine: High quality deterministic & contextual generation
 * Ensures the app works 100% reliably offline or out of the box without any setup
 */
const LocalAIEngine = {
  draftEmail({ contact, deal, tone = 'Professional', objective = 'Follow-up', customNotes = '', senderName = 'Sales Team', senderCompany = 'Our Company' }) {
    const contactName = contact?.name || 'there';
    const firstName = contactName.split(' ')[0];
    const company = contact?.company ? ` at ${contact.company}` : '';
    const dealTitle = deal?.title || 'our recent discussion';
    const dealStage = deal?.stage || 'Contacted';
    const dealVal = deal?.value ? `$${Number(deal.value).toLocaleString()}` : '';
    const notesSummary = contact?.notes || '';

    let subject = '';
    let greeting = '';
    let intro = '';
    let body = '';
    let callToAction = '';
    let signoff = '';

    // Tone variations
    if (tone === 'Friendly') {
      greeting = `Hi ${firstName},`;
      signoff = `Warm regards,\n${senderName}\n${senderCompany}`;
    } else if (tone === 'Casual') {
      greeting = `Hey ${firstName}!`;
      signoff = `Best,\n${senderName}`;
    } else if (tone === 'Urgent') {
      greeting = `Dear ${contactName},`;
      signoff = `Looking forward to your prompt response,\n${senderName}\n${senderCompany}`;
    } else if (tone === 'Persuasive') {
      greeting = `Dear ${firstName},`;
      signoff = `To your success,\n${senderName}\n${senderCompany}`;
    } else {
      // Professional
      greeting = `Dear ${contactName},`;
      signoff = `Best regards,\n${senderName}\n${senderCompany}`;
    }

    // Objective & Stage tailored content
    if (objective.toLowerCase().includes('proposal') || dealStage === 'Qualified') {
      subject = `Proposal follow-up: ${dealTitle} for ${contact?.company || contactName}`;
      intro = `I hope this email finds you well. I wanted to follow up on the proposal we prepared for ${dealTitle}${dealVal ? ` (${dealVal})` : ''}.`;
      body = `Based on our previous conversation regarding your team's goals${company}, we've designed a tailored approach to ensure seamless execution and strong ROI.`;
      if (notesSummary) {
        body += `\n\nI noted our discussion about: "${notesSummary.slice(0, 120)}..." and made sure those specific priorities are addressed.`;
      }
      callToAction = `Do you have 15 minutes this Thursday or Friday for a quick sync to review questions and confirm next steps?`;
    } else if (objective.toLowerCase().includes('demo') || dealStage === 'Contacted') {
      subject = `Next steps after our discussion - ${dealTitle}`;
      intro = `Thank you for taking the time to connect earlier. It was great learning more about your current workflow${company}.`;
      body = `We discussed how ${dealTitle} can help eliminate current bottlenecks and streamline your operations.`;
      if (customNotes) {
        body += `\n\nAs discussed: ${customNotes}`;
      }
      callToAction = `I would love to walk you through a tailored product walkthrough. Does Tuesday at 2:00 PM or Wednesday morning work for your schedule?`;
    } else if (objective.toLowerCase().includes('close') || dealStage === 'Won' || dealStage === 'Qualified') {
      subject = `Finalizing our partnership: ${dealTitle}`;
      intro = `I hope your week is going great. We are eager and prepared to support ${contact?.company || 'your team'} on ${dealTitle}.`;
      body = `Everything is lined up on our side to kick off onboarding as soon as we finalize the agreement${dealVal ? ` for ${dealVal}` : ''}.`;
      callToAction = `Please let me know if you need any adjustments or if you are ready for me to send over the final paperwork.`;
    } else if (objective.toLowerCase().includes('re-engage') || dealStage === 'Lost') {
      subject = `Checking in: Re-evaluating ${dealTitle} for ${contact?.company || contactName}`;
      intro = `I wanted to quickly check in and see how things have been evolving at ${contact?.company || 'your company'} since we last spoke.`;
      body = `We recently introduced some key enhancements that directly address the challenges we discussed regarding ${dealTitle}.`;
      callToAction = `Would you be open to a 10-minute catch-up next week to see if exploring this makes sense now?`;
    } else {
      // Default / General follow-up
      subject = `Follow-up regarding ${dealTitle} - ${contact?.company || contactName}`;
      intro = `I'm reaching out to follow up on our recent communications regarding ${dealTitle}.`;
      body = `I want to ensure you have all the information needed to evaluate how we can best support ${contact?.company || 'your organization'}.`;
      if (notesSummary) {
        body += `\n\nKey context from our notes: "${notesSummary.slice(0, 100)}..."`;
      }
      if (customNotes) {
        body += `\n\nNote: ${customNotes}`;
      }
      callToAction = `Let me know if you have any questions or if you'd like to schedule a brief call this week.`;
    }

    const fullEmail = `Subject: ${subject}

${greeting}

${intro}

${body}

${callToAction}

${signoff}`;

    return {
      subject,
      body: fullEmail,
      modelUsed: 'CRM Smart Assistant (Deterministic AI Engine)'
    };
  },

  summarizeContact({ contact, deals = [], activities = [] }) {
    const totalDeals = deals.length;
    const wonDeals = deals.filter(d => d.stage === 'Won');
    const activeDeals = deals.filter(d => !['Won', 'Lost'].includes(d.stage));
    const totalPipelineValue = deals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);
    const wonValue = wonDeals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);

    let sentiment = 'Positive & Engaged';
    if (deals.some(d => d.stage === 'Lost') && activeDeals.length === 0) {
      sentiment = 'Inactive / At-Risk';
    } else if (activeDeals.some(d => d.priority === 'High')) {
      sentiment = 'High Priority Lead / Hot Prospect';
    }

    const summaryPoints = [
      `• **Contact Profile**: ${contact.name} (${contact.job_title || 'Professional'} at ${contact.company || 'Private Organization'}). Status: **${contact.status || 'Lead'}**.`,
      `• **Pipeline Summary**: ${totalDeals} deal(s) recorded with total pipeline volume of **$${totalPipelineValue.toLocaleString()}** (Won: $${wonValue.toLocaleString()}).`,
      `• **Current Stage**: ${activeDeals.length > 0 ? `Active in "${activeDeals.map(d => d.stage).join(', ')}"` : (wonDeals.length > 0 ? 'Converted Customer' : 'No active pipeline deals')}.`,
      `• **Engagement History**: ${activities.length} recorded interactions/notes in CRM timeline.`
    ];

    if (contact.notes) {
      summaryPoints.push(`• **Notes Highlight**: "${contact.notes}"`);
    }

    const recommendations = [];
    if (activeDeals.some(d => d.stage === 'Qualified')) {
      recommendations.push('Prepare and schedule a proposal review or commercial negotiation call.');
    } else if (activeDeals.some(d => d.stage === 'Contacted')) {
      recommendations.push('Send interactive product demo recording and schedule a discovery call.');
    } else if (activeDeals.some(d => d.stage === 'New')) {
      recommendations.push('Perform initial discovery outreach within the next 24 hours.');
    } else if (wonDeals.length > 0) {
      recommendations.push('Check in for customer onboarding success, feedback, and explore upsell/referral opportunities.');
    } else {
      recommendations.push('Initiate re-engagement campaign with updated case studies and product updates.');
    }

    return {
      summary: summaryPoints.join('\n\n'),
      sentiment,
      pipelineValue: totalPipelineValue,
      recommendedActions: recommendations,
      modelUsed: 'CRM Executive Intelligence (Local Engine)'
    };
  },

  analyzeDeal({ deal, contact, activities = [] }) {
    let score = 50;
    let riskLevel = 'Medium';
    const strengths = [];
    const risks = [];
    const nextSteps = [];

    // Stage factors
    if (deal.stage === 'Won') {
      score = 100;
      riskLevel = 'None (Closed)';
      strengths.push('Deal successfully closed and won.');
      nextSteps.push('Trigger customer onboarding checklist and account handover.');
    } else if (deal.stage === 'Lost') {
      score = 0;
      riskLevel = 'Closed Lost';
      risks.push('Deal marked as lost. Document root loss reason (budget, timing, competitor).');
      nextSteps.push('Set follow-up reminder for 90-day re-evaluation check.');
    } else {
      if (deal.stage === 'Qualified') {
        score += 25;
        strengths.push('Budget and requirements are qualified.');
      } else if (deal.stage === 'Contacted') {
        score += 10;
        strengths.push('Initial contact established and dialogue active.');
      }

      if (deal.priority === 'High') {
        score += 10;
        strengths.push('High executive priority assigned.');
      }

      if (contact?.email && contact?.phone) {
        score += 10;
        strengths.push('Direct multi-channel contact information available.');
      } else {
        risks.push('Missing direct phone or verified contact channels.');
      }

      if (activities.length >= 3) {
        score += 10;
        strengths.push(`High engagement momentum with ${activities.length} logged interactions.`);
      } else {
        risks.push('Low interaction history; risk of deal going cold.');
        nextSteps.push('Schedule an interactive checkpoint or check-in email this week.');
      }

      if (deal.value > 25000) {
        risks.push('Enterprise-size value may require multi-stakeholder procurement approval.');
        nextSteps.push('Identify the economic buyer and procurement security requirements early.');
      }

      score = Math.min(Math.max(score, 15), 95);

      if (score >= 70) riskLevel = 'Low Risk (Strong momentum)';
      else if (score >= 45) riskLevel = 'Moderate Risk';
      else riskLevel = 'High Risk (Requires immediate outreach)';

      nextSteps.push(`Draft a customized follow-up email tailored to the '${deal.stage}' stage.`);
    }

    return {
      winProbability: score,
      riskLevel,
      strengths,
      risks,
      recommendedNextSteps: nextSteps,
      modelUsed: 'CRM Deal Intelligence AI'
    };
  }
};

/**
 * Main AI Service Interface
 */
async function generateAIEmail({ contact, deal, tone, objective, customNotes, senderName, senderCompany, apiKey, provider }) {
  // If user provided Gemini or OpenAI key
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const systemPrompt = `You are an elite B2B sales copywriter and CRM AI assistant. Draft high-converting, personalized, professional sales follow-up emails. Format your response strictly with:
Subject: <Subject Line>

<Email Body with Greeting, Context, Value Proposition, Call to Action, and Signoff>`;

      const userPrompt = `Draft a follow-up email with the following details:
- Recipient Name: ${contact?.name || 'Valued Client'}
- Recipient Company: ${contact?.company || 'N/A'}
- Job Title: ${contact?.job_title || 'N/A'}
- Contact Notes / Background: ${contact?.notes || 'N/A'}
- Deal Title: ${deal?.title || 'Our Collaboration'}
- Deal Stage: ${deal?.stage || 'Contacted'}
- Deal Value: ${deal?.value ? `$${deal.value}` : 'N/A'}
- Desired Tone: ${tone || 'Professional'}
- Specific Objective: ${objective || 'Follow up on discussion'}
- Extra Context / Instructions: ${customNotes || 'N/A'}
- Sender Name: ${senderName || 'Sales Representative'}
- Sender Company: ${senderCompany || 'Our Company'}

Write a concise, polished, natural-sounding email. Do NOT include placeholder tags like [Insert Date] unless absolutely necessary; use the provided context.`;

      let generatedText = '';
      if (provider === 'openai' || apiKey.startsWith('sk-')) {
        generatedText = await callOpenAI(apiKey, systemPrompt, userPrompt);
      } else {
        generatedText = await callGemini(apiKey, systemPrompt, userPrompt);
      }

      // Extract subject if available
      let subject = 'Follow-up regarding our discussion';
      const lines = generatedText.split('\n');
      const subjectLine = lines.find(l => l.toLowerCase().startsWith('subject:'));
      if (subjectLine) {
        subject = subjectLine.replace(/^subject:\s*/i, '').trim();
      }

      return {
        subject,
        body: generatedText,
        modelUsed: provider === 'openai' ? 'OpenAI GPT-4o-mini' : 'Google Gemini 1.5 Flash'
      };
    } catch (err) {
      console.warn('External AI API call failed, gracefully falling back to Local AI Engine:', err.message);
    }
  }

  // Fallback to our rich local deterministic engine
  return LocalAIEngine.draftEmail({ contact, deal, tone, objective, customNotes, senderName, senderCompany });
}

async function generateAISummary({ contact, deals, activities, apiKey, provider }) {
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const systemPrompt = `You are a CRM executive assistant summarizing customer accounts. Provide an executive summary, relationship status, key highlights from interactions, and 2-3 specific action items.`;
      const userPrompt = `Summarize this contact account:
Contact: ${JSON.stringify(contact)}
Deals: ${JSON.stringify(deals)}
Recent Activities: ${JSON.stringify(activities?.slice(0, 10))}`;

      let resultText = '';
      if (provider === 'openai' || apiKey.startsWith('sk-')) {
        resultText = await callOpenAI(apiKey, systemPrompt, userPrompt);
      } else {
        resultText = await callGemini(apiKey, systemPrompt, userPrompt);
      }

      return {
        summary: resultText,
        sentiment: 'Active Engagement',
        pipelineValue: deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0),
        recommendedActions: ['Review proposal terms', 'Send follow-up communication'],
        modelUsed: provider === 'openai' ? 'OpenAI GPT-4o-mini' : 'Google Gemini 1.5 Flash'
      };
    } catch (err) {
      console.warn('External AI summary failed, using Local Engine fallback:', err.message);
    }
  }

  return LocalAIEngine.summarizeContact({ contact, deals, activities });
}

async function generateAIDealInsights({ deal, contact, activities, apiKey, provider }) {
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const systemPrompt = `You are a senior sales director analyzing a deal in the CRM pipeline. Return a JSON object with: winProbability (number 0-100), riskLevel (string), strengths (array of strings), risks (array of strings), recommendedNextSteps (array of strings). Only return valid JSON.`;
      const userPrompt = `Deal: ${JSON.stringify(deal)}\nContact: ${JSON.stringify(contact)}\nActivities: ${JSON.stringify(activities?.slice(0, 8))}`;

      let resultText = '';
      if (provider === 'openai' || apiKey.startsWith('sk-')) {
        resultText = await callOpenAI(apiKey, systemPrompt, userPrompt);
      } else {
        resultText = await callGemini(apiKey, systemPrompt, userPrompt);
      }

      const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        ...parsed,
        modelUsed: provider === 'openai' ? 'OpenAI GPT-4o-mini' : 'Google Gemini 1.5 Flash'
      };
    } catch (err) {
      console.warn('External AI deal insight failed, using Local Engine fallback:', err.message);
    }
  }

  return LocalAIEngine.analyzeDeal({ deal, contact, activities });
}

module.exports = {
  generateAIEmail,
  generateAISummary,
  generateAIDealInsights
};
