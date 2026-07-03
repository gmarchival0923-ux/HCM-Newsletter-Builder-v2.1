import { NewsletterFields } from "./types";

// Helper to turn textarea content into HTML paragraphs safely
function renderParagraphs(text: string, color: string = "#334155", size: string = "15px", extraStyle: string = ""): string {
  if (!text) return "";
  return text
    .split(/\n\s*\n/)
    .map(p => p.replace(/\s+$/, ""))
    .filter(p => p.length > 0)
    .map(p => {
      const lines = p.split("\n").map(line => {
        let processed = line;
        const leadingSpacesMatch = processed.match(/^(\s+)/);
        if (leadingSpacesMatch) {
          const spaces = leadingSpacesMatch[1];
          processed = "&nbsp;".repeat(spaces.length) + processed.substring(spaces.length);
        }
        processed = processed.replace(/(?<=•|[-*])(\s+)/g, (match) => "&nbsp;".repeat(match.length));
        processed = processed.replace(/ {2,}/g, (match) => "&nbsp;".repeat(match.length));
        return processed;
      });
      return `<p style="color: ${color}; font-size: ${size}; line-height: 1.625; margin: 0 0 16px 0; ${extraStyle}">${lines.join("<br />")}</p>`;
    })
    .join("\n");
}

function renderLegacyParagraphs(text: string, color: string = "#334155", size: string = "14px"): string {
  if (!text) return "";
  return text
    .split(/\n\s*\n/)
    .map(p => p.replace(/\s+$/, ""))
    .filter(p => p.length > 0)
    .map(p => {
      const lines = p.split("\n").map(line => {
        let processed = line;
        const leadingSpacesMatch = processed.match(/^(\s+)/);
        if (leadingSpacesMatch) {
          const spaces = leadingSpacesMatch[1];
          processed = "&nbsp;".repeat(spaces.length) + processed.substring(spaces.length);
        }
        processed = processed.replace(/(?<=•|[-*])(\s+)/g, (match) => "&nbsp;".repeat(match.length));
        processed = processed.replace(/ {2,}/g, (match) => "&nbsp;".repeat(match.length));
        return processed;
      });
      return `<p style="color: ${color}; font-size: ${size}; text-align: justify; margin: 10px 0;">${lines.join("<br />")}</p>`;
    })
    .join("\n");
}

export function renderModernHTML(fields: NewsletterFields): string {
  let preheaderDate = fields.dateText || "";
  if (preheaderDate && !preheaderDate.toLowerCase().startsWith("week of")) {
    preheaderDate = `Week of ${preheaderDate}`;
  }

  const editorNoteHtml = renderParagraphs(fields.editorParagraphs, "#334155", "15px");
  const leadStoryNoteHtml = renderParagraphs(fields.leadStoryParagraphs, "#334155", "15px");
  const hotTakesHtml = renderParagraphs(fields.hotTakesParagraphs, "#334155", "15px");

  const awardsHtml = fields.awardsList.map(award => `
    <div style="font-size: 13px; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
      ${award.imageUrl ? `<img src="${award.imageUrl}" alt="${award.name || ''}" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; display: block;" />` : ""}
      <strong style="color: #0f172a; display: block; font-size: 14px;">${award.name}</strong>
      <span style="color: #64748b; font-size: 12px; display: block; margin-bottom: 8px;">${award.deadline}</span>
      <div style="margin-top: 6px;">
        <a href="${award.buttonUrl}" target="_blank" class="btn btn-primary" style="font-size: 11px; padding: 6px 14px; background-color: #2563eb; border-radius: 6px; text-decoration: none; display: inline-block; color: #ffffff !important;">${award.buttonText}</a>
      </div>
    </div>
  `).join("");

  const isAwardsActive = fields.awardsSectionTitle || fields.awardsList.length > 0;

  const renderModernCardHtml = (card: any) => {
    let badgeClass = "badge-podcast";
    let btnBg = "#ea580c";
    const labelLower = (card.label || "").toLowerCase();
    
    if (labelLower.includes("podcast")) {
      badgeClass = "badge-podcast";
      btnBg = "#ea580c";
    } else if (labelLower.includes("marketing webcast")) {
      badgeClass = "badge-webcast";
      btnBg = "#7c3aed";
    } else if (labelLower.includes("hr webcast")) {
      badgeClass = "badge-webcast";
      btnBg = "#2563eb";
    } else if (labelLower.includes("research")) {
      badgeClass = "badge-research";
      btnBg = "#db2777";
    } else if (labelLower.includes("winner")) {
      badgeClass = "badge-winners";
      btnBg = "#16a34a";
    } else {
      badgeClass = "badge-awards";
      btnBg = "#2563eb";
    }

    return `
      <div class="card" style="height: 100%; margin-bottom: 0;">
        <div>
          <span class="badge ${badgeClass}">${card.label}</span>
          ${card.img ? `
          <div style="border-radius: 12px; overflow: hidden; margin: 12px 0; border: 1px solid #e2e8f0;">
            <img src="${card.img}" alt="${card.title || ''}" style="width: 100%;" />
          </div>` : ""}
          <h3 class="card-title">${card.title}</h3>
          ${card.content ? `<p style="font-size: 13px; color: #475569; margin: 0;">${card.content}</p>` : ""}
        </div>
        ${(card.buttonText && card.buttonUrl) ? `
        <div style="padding-top: 16px;">
          <a href="${card.buttonUrl}" target="_blank" class="btn btn-primary" style="font-size: 11px; padding: 8px 16px; background-color: ${btnBg}; width: 100%; text-decoration: none; color: #ffffff !important; text-align: center;">${card.buttonText}</a>
        </div>` : ""}
      </div>
    `;
  };

  const renderModernAwardsCardHtml = () => {
    return `
      <div class="card" style="height: 100%; margin-bottom: 0;">
        <div>
          <span class="badge badge-awards">${fields.awardsLabel || "HR.com Awards"}</span>
          ${fields.awardsSectionTitle ? `<h3 class="card-title" style="margin-bottom: 12px;">${fields.awardsSectionTitle}</h3>` : ""}
          ${awardsHtml}
        </div>
      </div>
    `;
  };

  const activeSpotlightCards = fields.spotlightCards ? fields.spotlightCards.filter(c => c.title && c.title.trim() !== "") : [];
  const gridItems: string[] = [];
  
  let awardsPos = fields.awardsPositionIndex !== undefined ? fields.awardsPositionIndex : activeSpotlightCards.length;
  awardsPos = Math.max(0, Math.min(awardsPos, activeSpotlightCards.length));

  activeSpotlightCards.forEach((card, idx) => {
    if (isAwardsActive && idx === awardsPos) {
      gridItems.push(renderModernAwardsCardHtml());
    }
    gridItems.push(renderModernCardHtml(card));
  });
  if (isAwardsActive && awardsPos >= activeSpotlightCards.length) {
    gridItems.push(renderModernAwardsCardHtml());
  }

  let modernGridRowsHtml = "";
  for (let i = 0; i < gridItems.length; i += 2) {
    if (i + 1 < gridItems.length) {
      modernGridRowsHtml += `
        <tr class="column-tr">
          <td class="column-td">
            ${gridItems[i]}
          </td>
          <td class="column-td">
            ${gridItems[i+1]}
          </td>
        </tr>
      `;
    } else {
      modernGridRowsHtml += `
        <tr class="column-tr">
          <td colspan="2" align="center" style="padding: 12px !important;">
            <div style="max-width: 300px; text-align: left; margin: 0 auto; width: 100%;">
              ${gridItems[i]}
            </div>
          </td>
        </tr>
      `;
    }
  }

  return `<!DOCTYPE html>
<html lang="en" dir="ltr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${fields.headerTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <style type="text/css">
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background-color: #f8fafc !important;
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    * { box-sizing: border-box; }
    table {
      border-spacing: 0 !important;
      border-collapse: collapse !important;
      table-layout: fixed !important;
      margin: 0 auto !important;
    }
    td { padding: 0; }
    p {
      margin: 0 0 16px 0;
      font-size: 15px;
      line-height: 1.625;
      color: #334155;
    }
    h1, h2, h3, h4 {
      margin: 0;
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-weight: 700;
      color: #0f172a;
    }
    img {
      border: 0;
      height: auto !important;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    a {
      text-decoration: none;
      color: #2563eb;
    }
    .container {
      max-width: 650px !important;
      width: 100% !important;
      margin: 40px auto !important;
      background-color: #ffffff !important;
      border-radius: 20px !important;
      overflow: hidden !important;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 8px 10px -6px rgba(15, 23, 42, 0.04) !important;
      border: 1px solid #f1f5f9 !important;
    }
    .badge {
      display: inline-block;
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-radius: 100px;
      margin-bottom: 12px;
    }
    .badge-lead { background-color: #ecfdf5; color: #059669; }
    .badge-marketing { background-color: #fef2f2; color: #dc2626; }
    .badge-podcast { background-color: #fff7ed; color: #ea580c; }
    .badge-webcast { background-color: #f5f3ff; color: #7c3aed; }
    .badge-research { background-color: #fdf2f8; color: #db2777; }
    .badge-winners { background-color: #f0fdf4; color: #16a34a; }
    .badge-awards { background-color: #eff6ff; color: #2563eb; }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 700;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: 12px;
      color: #ffffff !important;
    }
    .btn-primary { background-color: #2563eb; }
    .btn-secondary { background-color: #0f172a; }
    .card {
      background-color: #f8fafc;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
    }
    .card-title {
      font-size: 18px;
      line-height: 1.4;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .column-table { width: 100% !important; }
    .column-td {
      width: 50% !important;
      padding: 12px !important;
      vertical-align: top !important;
    }
    @media screen and (max-width: 650px) {
      .container {
        margin: 0 !important;
        border-radius: 0 !important;
        border: none !important;
        box-shadow: none !important;
      }
      .column-table {
        display: block !important;
        width: 100% !important;
      }
      .column-tr {
        display: block !important;
        width: 100% !important;
      }
      .column-td {
        display: block !important;
        width: 100% !important;
        padding: 12px 0 !important;
        box-sizing: border-box !important;
      }
      .column-td .card {
        max-width: 100% !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .px-mobile-20 {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
    }
    @media (prefers-color-scheme: dark) {
      body, html { background-color: #0f172a !important; }
      .container {
        background-color: #1e293b !important;
        border-color: #334155 !important;
      }
      p { color: #94a3b8 !important; }
      h1, h2, h3, h4 { color: #f8fafc !important; }
      .card {
        background-color: #0f172a !important;
        border-color: #334155 !important;
      }
      .card-title { color: #f8fafc !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <!-- preheader -->
  <div style="
        font-size: 0px;
        color: #fafdfe;
        mso-line-height-rule: exactly;
        line-height: 0px;
        display: none;
        max-width: 0px;
        max-height: 0px;
        opacity: 0;
        overflow: hidden;
        mso-hide: all;
      ">
    ${preheaderDate}
  </div>
  <!-- preheader -->
  <div class="container">
    ${fields.hideHeader ? "" : `
    <!-- HEADER -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);">
      <tr>
        <td style="padding: 32px 40px 40px 40px;" class="px-mobile-20">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="right" style="padding-bottom: 24px;">
                <a href="${fields.signupUrl}" target="_blank" style="background-color: rgba(255, 255, 255, 0.15); color: #ffffff; padding: 8px 18px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid rgba(255, 255, 255, 0.25); text-decoration: none;">${fields.signupText}</a>
              </td>
            </tr>
            <tr>
              <td align="center">
                <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; line-height: 1.25; letter-spacing: -0.02em; text-align: center; margin-bottom: 12px;">
                  ${fields.headerTitle}
                </h1>
                <p style="color: #94a3b8; font-size: 15px; margin-bottom: 0; text-align: center; max-width: 480px; margin: 0 auto; line-height: 1.4;">
                  ${fields.headerSubtitle}
                </p>
                ${fields.headerImg ? `
                <div style="overflow: hidden; margin: 12px 0px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); border: 1px solid #e2e8f0;">
                  <img src="${fields.headerImg}" alt="${fields.headerImgAlt || ''}" style="width: 100%; object-fit: cover;" id="header-img"/>
                </div>` : ""}
                <div style="height: 1px; background-color: rgba(255,255,255,0.1); margin: 24px 0 16px 0; width: 100%;"></div>
                <p style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #38bdf8; margin: 0; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">
                  Bi-Weekly Issue &bull; ${fields.dateText}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- RAINBOW DIVIDER -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="height: 5px; background: linear-gradient(to right, #ef4444, #f59e0b, #10b981, #3b82f6, #6366f1, #d946ef);"></td>
      </tr>
    </table>
    `}

    <!-- CONTENT BODY -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding: 40px 40px 20px 40px;" class="px-mobile-20">
          ${(() => {
            const editorHtml = (!fields.hideEditor && fields.editorParagraphs) ? `
            <!-- EDITOR'S NOTE Section -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td valign="top">
                        ${fields.editorSalutation ? `<p style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">${fields.editorSalutation}</p>` : ""}
                        ${editorNoteHtml}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>` : "";

            const topAdHtml = (!fields.hideTopAd && fields.topAdImg) ? `
            <!-- TOP SPONSOR AD SECTION -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding-top: 5px; padding-bottom: 12px;">
                  <div style="padding: 0; margin-bottom: 0; text-align: center; max-width: 300px; margin: 0 auto;">
                    <a href="${fields.topAdUrl}" target="_blank">
                      <img src="${fields.topAdImg}" width="300" height="250" alt="${fields.topAdAlt || ''}" style="margin: 0 auto; display: block;" />
                    </a>
                  </div>
                </td>
              </tr>
            </table>` : "";

            const leadStoryHtml = (!fields.hideLeadStory && (fields.leadStoryTitle || fields.leadStoryParagraphs)) ? `
            <!-- LEAD STORY SECTION -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  ${fields.leadTitleLabel ? `<span class="badge badge-lead">${fields.leadTitleLabel}</span>` : ""}
                  ${fields.leadStoryTitle ? `<h2 style="font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3; margin-bottom: 8px; letter-spacing: -0.02em;">${fields.leadStoryTitle}</h2>` : ""}
                  ${fields.leadStoryAuthor ? `<p style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748b; margin-bottom: 20px;">${fields.leadStoryAuthor}</p>` : ""}
                  
                  ${fields.leadImg ? `
                  <div style="border-radius: 16px; overflow: hidden; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); border: 1px solid #e2e8f0;">
                    <img src="${fields.leadImg}" alt="${fields.leadStoryTitle || ''}" style="width: 100%; object-fit: cover;" />
                  </div>` : ""}
                  
                  ${leadStoryNoteHtml}
                  
                  ${(fields.leadStoryButtonText && fields.leadStoryButtonUrl) ? `
                  <div style="padding-top: 8px; padding-bottom: 24px;">
                    <a href="${fields.leadStoryButtonUrl}" target="_blank" class="btn btn-secondary" style="font-size: 11px; text-decoration: none;">${fields.leadStoryButtonText}</a>
                  </div>` : ""}
                </td>
              </tr>
            </table>` : "";

            const hotTakesSectionHtml = (!fields.hideHotTakes && fields.hotTakesParagraphs) ? `
            <!-- HOT MARKETING TAKES SECTION -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  ${fields.hotTakesTitleLabel ? `<span class="badge badge-marketing">${fields.hotTakesTitleLabel}</span>` : ""}
                  
                  ${fields.hotTakesImg ? `
                  <div style="border-radius: 16px; overflow: hidden; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                    <img src="${fields.hotTakesImg}" alt="Marketing Takes" style="width: 100%; object-fit: cover;" />
                  </div>` : ""}

                  ${hotTakesHtml}
                </td>
              </tr>
            </table>` : "";

            const columnsHtml = (!fields.hideColumns && gridItems.length > 0) ? `
            <!-- COLUMNS SECTION (Dynamic 2-column layout) -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" class="column-table">
              ${modernGridRowsHtml}
            </table>` : "";

            const bottomAdHtml = (!fields.hideBottomAd && fields.bottomAdImg) ? `
            <!-- BOTTOM SPONSOR AD SECTION -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 8px 0 8px 0;">
              <tr>
                <td align="center">
                  <div style="padding: 0; max-width: 300px; text-align: center; margin: 0 auto;">
                    <a href="${fields.bottomAdUrl}" target="_blank">
                      <img src="${fields.bottomAdImg}" width="300" height="250" alt="${fields.bottomAdAlt || ''}" style="margin: 0 auto; display: block;" />
                    </a>
                  </div>
                </td>
              </tr>
            </table>` : "";

            const pollHtml = (!fields.hidePollSection && fields.pollQuestion) ? `
            <!-- WEEKLY POLL SECTION -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 40px;">
              <tr>
                <td>
                  <div style="background-color: #f8fafc; border-radius: 20px; border: 2px solid #e2e8f0; padding: 32px 24px; text-align: center;">
                    ${fields.pollTitle ? `<span class="badge badge-marketing" style="background-color: #fef2f2; color: #ef4444;">${fields.pollTitle}</span>` : ""}
                    <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 24px; line-height: 1.4;">
                      ${fields.pollQuestion}
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 400px; margin: 0 auto;">
                      ${fields.pollChoices && fields.pollChoices.length > 0 ? 
                        fields.pollChoices.filter(choice => choice.text && choice.text.trim() !== "").map((choice, index, arr) => `
                      <tr>
                        <td style="${index < arr.length - 1 ? 'padding-bottom: 12px;' : ''}">
                          <a href="${choice.url || "#"}" target="_blank" style="display: block; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px 20px; text-align: left; font-size: 13px; font-weight: 600; color: #334155; text-decoration: none;">
                            <span style="display: inline-block; width: 14px; height: 14px; border: 2px solid #94a3b8; border-radius: 50%; vertical-align: -3px; margin-right: 12px;"></span>
                            ${choice.text}
                          </a>
                        </td>
                      </tr>`).join("\n")
                      : `
                      ${fields.pollChoice1 ? `
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <a href="${fields.pollChoice1Url}" target="_blank" style="display: block; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px 20px; text-align: left; font-size: 13px; font-weight: 600; color: #334155; text-decoration: none;">
                            <span style="display: inline-block; width: 14px; height: 14px; border: 2px solid #94a3b8; border-radius: 50%; vertical-align: -3px; margin-right: 12px;"></span>
                            ${fields.pollChoice1}
                          </a>
                        </td>
                      </tr>` : ""}
                      ${fields.pollChoice2 ? `
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <a href="${fields.pollChoice2Url}" target="_blank" style="display: block; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px 20px; text-align: left; font-size: 13px; font-weight: 600; color: #334155; text-decoration: none;">
                            <span style="display: inline-block; width: 14px; height: 14px; border: 2px solid #94a3b8; border-radius: 50%; vertical-align: -3px; margin-right: 12px;"></span>
                            ${fields.pollChoice2}
                          </a>
                        </td>
                      </tr>` : ""}
                      ${fields.pollChoice3 ? `
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <a href="${fields.pollChoice3Url}" target="_blank" style="display: block; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px 20px; text-align: left; font-size: 13px; font-weight: 600; color: #334155; text-decoration: none;">
                            <span style="display: inline-block; width: 14px; height: 14px; border: 2px solid #94a3b8; border-radius: 50%; vertical-align: -3px; margin-right: 12px;"></span>
                            ${fields.pollChoice3}
                          </a>
                        </td>
                      </tr>` : ""}
                      ${fields.pollChoice4 ? `
                      <tr>
                        <td>
                          <a href="${fields.pollChoice4Url}" target="_blank" style="display: block; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px 20px; text-align: left; font-size: 13px; font-weight: 600; color: #334155; text-decoration: none;">
                            <span style="display: inline-block; width: 14px; height: 14px; border: 2px solid #94a3b8; border-radius: 50%; vertical-align: -3px; margin-right: 12px;"></span>
                            ${fields.pollChoice4}
                          </a>
                        </td>
                      </tr>` : ""}`}
                    </table>
                  </div>
                </td>
              </tr>
            </table>` : "";

            const sectionsMap: Record<string, string> = {
              editor: editorHtml,
              topAd: topAdHtml,
              leadStory: leadStoryHtml,
              hotTakes: hotTakesSectionHtml,
              columns: columnsHtml,
              bottomAd: bottomAdHtml,
              poll: pollHtml
            };

            const activeSequence = fields.sectionsOrder || ["editor", "topAd", "leadStory", "hotTakes", "columns", "bottomAd", "poll"];
            const activeKeys = activeSequence.filter(key => {
              const html = sectionsMap[key];
              return html && html.trim() !== "";
            });

            let finalHtml = "";
            activeKeys.forEach((key, idx) => {
              finalHtml += sectionsMap[key];
              if (idx < activeKeys.length - 1) {
                if (key !== "editor" && key !== "topAd") {
                  finalHtml += '\n<div style="height: 1px; background-color: #f1f5f9; margin-bottom: 40px; width: 100%;"></div>\n';
                } else {
                  finalHtml += '\n';
                }
              }
            });

            return finalHtml;
          })()}
        </td>
      </tr>
    </table>

    ${fields.hideFooter ? "" : `
    <!-- FORWARD BANNER -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9;">
      <tr>
        <td style="padding: 24px 40px; text-align: center;" class="px-mobile-20">
          <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">Was this email forwarded to you?</p>
          <p style="font-size: 13px; color: #475569; margin-bottom: 12px;">
            Get the latest trends and insights delivered straight to your inbox.
          </p>
          <a href="${fields.signupUrl}" target="_blank" class="btn btn-secondary" style="font-size: 11px; padding: 8px 20px; border-radius: 8px; text-decoration: none;">
            Subscribe to HCM Newsletter &rarr;
          </a>
        </td>
      </tr>
    </table>

    <!-- FOOTER DIVIDER -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="height: 5px; background: linear-gradient(to right, #ef4444, #f59e0b, #10b981, #3b82f6, #6366f1, #d946ef);"></td>
      </tr>
    </table>

    <!-- FOOTER -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f172a;">
      <tr>
        <td style="padding: 40px;" class="px-mobile-20">
          <!-- Social Icons -->
          <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom: 24px;">
            <tr>
              ${fields.footerFacebookUrl ? `<td style="padding: 0 2px;"><a href="${fields.footerFacebookUrl}" target="_blank"><img src="https://public-cdn.hr.com/remoteimages/website-images/2025_siteupdate/community-emailer/facebook.png" width="24" height="24" alt="Facebook" style="filter: brightness(0) invert(1);" /></a></td>` : ""}
              ${fields.footerLinkedinUrl ? `<td style="padding: 0 2px;"><a href="${fields.footerLinkedinUrl}" target="_blank"><img src="https://public-cdn.hr.com/remoteimages/website-images/2025_siteupdate/community-emailer/linkedin.png" width="24" height="24" alt="LinkedIn" style="filter: brightness(0) invert(1);" /></a></td>` : ""}
              ${fields.footerInstagramUrl ? `<td style="padding: 0 2px;"><a href="${fields.footerInstagramUrl}" target="_blank"><img src="https://public-cdn.hr.com/remoteimages/website-images/2025_siteupdate/community-emailer/instagram.png" width="24" height="24" alt="Instagram" style="filter: brightness(0) invert(1);" /></a></td>` : ""}
              ${fields.footerYoutubeUrl ? `<td style="padding: 0 2px;"><a href="${fields.footerYoutubeUrl}" target="_blank"><img src="https://public-cdn.hr.com/remoteimages/website-images/2025_siteupdate/community-emailer/youtube.png" width="24" height="24" alt="YouTube" style="filter: brightness(0) invert(1);" /></a></td>` : ""}
              ${fields.footerTwitterUrl ? `<td style="padding: 0 2px;"><a href="${fields.footerTwitterUrl}" target="_blank"><img src="https://public-cdn.hr.com/remoteimages/website-images/2025_siteupdate/community-emailer/x.png" width="24" height="24" alt="X" style="filter: brightness(0) invert(1);" /></a></td>` : ""}
            </tr>
          </table>

          <div style="height: 24px; line-height: 24px; font-size: 1px;">&nbsp;</div>

          <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-bottom: 20px; line-height: 1.5;">
            ${fields.footerClosingText}
          </p>

          <p style="text-align: center; margin-bottom: 24px;">
            <a href="${fields.footerSubscribeUrl}" target="_blank" style="color: #38bdf8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none;">
              ${fields.footerSubscribeText} &rarr;
            </a>
          </p>

          <p style="color: #64748b; font-size: 11px; text-align: center; line-height: 1.8; margin-bottom: 24px;">
            <a href="${fields.footerUnsubscribeUrl}" target="_blank" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a> &bull; 
            <a href="${fields.footerManageSubscriptionUrl}" target="_blank" style="color: #94a3b8; text-decoration: underline;">Manage Subscription</a> &bull; 
            <a href="${fields.footerAdvertiseUrl}" target="_blank" style="color: #94a3b8; text-decoration: underline;">Advertise with us</a> &bull; 
            <a href="${fields.footerPrivacyPolicyUrl}" target="_blank" style="color: #94a3b8; text-decoration: underline;">Privacy Policy</a> &bull; 
            <a href="${fields.footerContactUsUrl}" style="color: #94a3b8; text-decoration: underline;">Contact Us</a>
          </p>

          <p style="color: #64748b; font-size: 11px; text-align: center; line-height: 1.6; margin-bottom: 0;">
            ${fields.footerCopyrightText}<br /><br />
            ${fields.footerDisclaimerText}
          </p>
        </td>
      </tr>
    </table>
    `}
  </div>
</body>
</html>`;
}

export function renderLegacyHTML(fields: NewsletterFields): string {
  let preheaderDate = fields.dateText || "";
  if (preheaderDate && !preheaderDate.toLowerCase().startsWith("week of")) {
    preheaderDate = `Week of ${preheaderDate}`;
  }

  const editorNoteHtml = renderLegacyParagraphs(fields.editorParagraphs, "#334155", "14px");
  const leadStoryNoteHtml = renderLegacyParagraphs(fields.leadStoryParagraphs, "#334155", "14px");
  const hotTakesHtml = renderLegacyParagraphs(fields.hotTakesParagraphs, "#334155", "14px");

  const awardsListHtml = fields.awardsList.map(award => `
    <div style="padding:10px; border-bottom: 1px solid #e2e8f0; margin-bottom: 10px;">
      ${award.imageUrl ? `<div style="text-align:center; margin-bottom: 8px;"><img src="${award.imageUrl}" alt="${award.name || ''}" style="max-width: 100%; height: auto; border-radius: 4px; display: inline-block;" /></div>` : ""}
      <h3 style="font:14px Roboto, Arial, sans-serif; color:#334155; text-align:center; margin-bottom:5px;">
        <b>${award.name}</b><br>${award.deadline}
      </h3>
      <div style="text-align:center; margin:15px;">
        <a href="${award.buttonUrl}" target="_blank" style="font:12px Roboto, Arial, sans-serif; text-decoration:none; background:#175e69; padding:7px 15px; color:#fff; display: inline-block; border-radius: 4px;">${award.buttonText}</a>
      </div>
    </div>
  `).join("");

  const isAwardsActive = fields.awardsSectionTitle || fields.awardsList.length > 0;

  const renderLegacyCardHtml = (card: any) => {
    let badgeBg = "#175e69";
    const labelLower = (card.label || "").toLowerCase();
    
    if (labelLower.includes("podcast")) {
      badgeBg = "#f0493c";
    } else if (labelLower.includes("marketing webcast")) {
      badgeBg = "#ea4397";
    } else if (labelLower.includes("hr webcast")) {
      badgeBg = "#2a5a8d";
    } else if (labelLower.includes("research")) {
      badgeBg = "#9e320a";
    } else if (labelLower.includes("winner")) {
      badgeBg = "#435a1b";
    } else {
      badgeBg = "#175e69";
    }

    return `
      <table class="column" width="100%" role="presentation" style="border-spacing:0; height: 100%;">
        <tbody>
          <tr>
            <td style="padding: 10px; background: #ffffff !important; vertical-align: top;">
              <div style="background:${badgeBg}; color:#fff; font:16px Roboto, Arial, sans-serif; padding:6px; text-align:center;">
                <b>${card.label}</b>
              </div>
              ${card.img ? `
              <div class="section-img-wrap" style="width:100%; height:70px; margin-top: 5px;">
                <img src="${card.img}" alt="${card.title || ''}" border="0" style="height:100%; width:100%; object-fit:cover; overflow:hidden;">
              </div>` : ""}
              <div style="padding:10px;">
                <h3 style="font:15px Roboto, Arial, sans-serif; color:#334155; text-align:center; margin-bottom: 8px;">
                  <b>${card.title}</b>
                </h3>
                ${card.content ? `<p style="font-size:14px; font-weight:normal; margin-top:5px; text-align:center; color:#475569;">${card.content}</p>` : ""}
                ${(card.buttonText && card.buttonUrl) ? `
                <div style="text-align:center; margin:20px;">
                  <a href="${card.buttonUrl}" target="_blank" style="padding:7px 25px; background:${badgeBg}; font:12px Roboto, Arial, sans-serif; text-decoration:none; color:#fff; display: inline-block; border-radius: 4px;">${card.buttonText}</a>
                </div>` : ""}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `;
  };

  const renderLegacyAwardsCardHtml = () => {
    return `
      <table class="column" width="100%" role="presentation" style="border-spacing:0; height: 100%;">
        <tbody>
          <tr>
            <td style="padding: 10px; background: #ffffff !important; vertical-align: top;">
              <div style="background:#175e69; color:#fff; font:16px Roboto, Arial, sans-serif; padding:6px; text-align:center;">
                <b>${fields.awardsLabel || "HR.com Awards"}</b>
              </div>
              <div class="section-img-wrap" style="width:100%; height:70px; margin-top: 5px;">
                <img src="https://public-cdn.hr.com/remoteimages/website-images/community-emailer/2025/2026/hcm-sales-and-marketing/March/hr-com-awards-350x70.jpg" alt="Awards" border="0" style="height:100%; width:100%; object-fit:cover; overflow:hidden;">
              </div>
              <div style="padding:10px;">
                ${fields.awardsSectionTitle ? `<h3 style="font:15px Roboto, Arial, sans-serif; color:#334155; text-align:center;">
                  <b>${fields.awardsSectionTitle}</b>
                </h3>` : ""}
                ${awardsListHtml}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `;
  };

  const activeSpotlightCards = fields.spotlightCards ? fields.spotlightCards.filter(c => c.title && c.title.trim() !== "") : [];
  const legacyGridItems: string[] = [];
  
  let awardsPos = fields.awardsPositionIndex !== undefined ? fields.awardsPositionIndex : activeSpotlightCards.length;
  awardsPos = Math.max(0, Math.min(awardsPos, activeSpotlightCards.length));

  activeSpotlightCards.forEach((card, idx) => {
    if (isAwardsActive && idx === awardsPos) {
      legacyGridItems.push(renderLegacyAwardsCardHtml());
    }
    legacyGridItems.push(renderLegacyCardHtml(card));
  });
  if (isAwardsActive && awardsPos >= activeSpotlightCards.length) {
    legacyGridItems.push(renderLegacyAwardsCardHtml());
  }

  let legacyGridRowsHtml = "";
  for (let i = 0; i < legacyGridItems.length; i += 2) {
    if (i + 1 < legacyGridItems.length) {
      legacyGridRowsHtml += `
        <tr>
          <td align="center" style="background:#ffffff; padding: 0 20px 20px 20px; background: #ffffff !important; vertical-align: top; width: 50% !important;">
            <div style="display:inline-block; width:100%; max-width:320px; vertical-align:top; text-align:left;">
              ${legacyGridItems[i]}
            </div>
          </td>
          <td align="center" style="background:#ffffff; padding: 0 20px 20px 20px; background: #ffffff !important; vertical-align: top; width: 50% !important;">
            <div style="display:inline-block; width:100%; max-width:320px; vertical-align:top; text-align:left;">
              ${legacyGridItems[i+1]}
            </div>
          </td>
        </tr>
      `;
    } else {
      legacyGridRowsHtml += `
        <tr>
          <td colspan="2" align="center" style="background:#ffffff; padding: 0 20px 20px 20px; background: #ffffff !important; vertical-align: top;">
            <div style="display:inline-block; width:100%; max-width:320px; vertical-align:top; text-align:left; margin: 0 auto;">
              ${legacyGridItems[i]}
            </div>
          </td>
        </tr>
      `;
    }
  }

  return `<!-- @format -->
<!DOCTYPE html>
<html lang="en" dir="ltr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${fields.headerTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap" rel="stylesheet" />
  <style type="text/css">
    html { overflow-x: hidden !important; }
    body { overflow-x: hidden !important; width: 100% !important; }
    * { box-sizing: border-box; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { padding: 0; }
    p { font-size: 16px; line-height: 1.5 !important; line-height: 1.3; }
    img { border: 0; max-width: 100% !important; height: auto !important; }
    .content { line-height: 20px; font-size: 16px; line-height: 1.5 !important; }
    @media screen and (max-width: 900px) {
      body, div, table, td, th, p, a, img, h1, h2, h3, h4, h5, h6 {
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      body { overflow-x: hidden !important; width: 100% !important; }
      div[style*="max-width: 700px"], div[style*="max-width:700px"] {
        width: 100% !important;
        max-width: 100% !important;
        overflow-x: hidden !important;
      }
      table, tbody, tr { width: 100% !important; max-width: 100% !important; }
      td { display: block !important; width: 100% !important; max-width: 100% !important; }
      table.column { display: block !important; width: 100% !important; max-width: 100% !important; margin: 0 auto !important; }
      img { width: 100% !important; max-width: 100% !important; height: auto !important; }
      .section-img-wrap, .lead-img-wrap { width: 100% !important; height: auto !important; min-height: 60px !important; }
      .section-img-wrap img, .lead-img-wrap img { width: 100% !important; height: auto !important; object-fit: cover !important; }
    }
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    @media (prefers-color-scheme: dark) {
      body, center, table, .darkmode-bg { background: #2d2d2d !important; color: #ffffff !important; }
    }
  </style>
</head>
<body class="body" xml:lang="en" style="margin: 0; padding: 0; background-color: #f6f9fc; overflow-x: hidden;">
  <!-- preheader -->
  <div style="
        font-size: 0px;
        color: #fafdfe;
        mso-line-height-rule: exactly;
        line-height: 0px;
        display: none;
        max-width: 0px;
        max-height: 0px;
        opacity: 0;
        overflow: hidden;
        mso-hide: all;
      ">
    ${preheaderDate}
  </div>
  <!-- preheader -->
  <div style="background-color: #f7fafc; color: #334155; font: 14px / 20px Roboto, Arial, sans-serif; font-size: 16px; line-height: 1.5 !important; margin: 0 auto 40px; width: 100%; max-width: 700px; overflow-x: hidden;">
    <div style="width: 100%; max-width: 700px; background-color: #ffffff !important; color: #334155; font: 14px / 20px Roboto, Arial, sans-serif; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); margin: 0 auto; box-sizing: border-box;">
      
      <table align="center" style="border-spacing: 0; border-collapse: collapse; font: 14px / 20px Roboto, Arial, sans-serif; font-size: 16px; line-height: 1.5 !important; background-color: #ffffff !important; margin: 0 auto; padding: 0; width: 100%; max-width: 700px; padding-top: 15px; background: #fff !important;" role="presentation">
        
        <!-- SIGNUP -->
        ${fields.hideHeader ? "" : `
        ${(fields.signupText && fields.signupUrl) ? `
        <tr>
          <td>
            <table width="100%" style="border-spacing: 0" role="presentation">
              <tbody>
                <tr>
                  <td style="padding: 20px; text-align: right; background-color: #ffffff !important;">
                    <a href="${fields.signupUrl}" target="_blank" style="text-decoration: none; font: 14px Roboto, Arial, sans-serif; background: #2a5a8d; color: #fff; padding: 10px; width: 60px;">${fields.signupText}</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>` : ""}

        <!-- TITLE -->
        <tr>
          <td style="padding: 0; background-color: #ffffff !important;">
            <table width="100%" style="border-spacing: 0" role="presentation">
              <tr>
                <td style="text-align: center; background-color: #ffffff !important;">
                  <h1 class="fallback-font" style="font: 32px Roboto, Arial, sans-serif; color: #2a5a8d; margin: 10px 20px;">
                    <b>${fields.headerTitle.replace("Bi-Weekly", "")}</b> <br><b style="font-size: 20px;">Bi-Weekly</b><br>
                    ${fields.headerSubtitle ? `<p style="font-size: 18px; margin: 10px;">${fields.headerSubtitle}</p>` : ""}
                  </h1>
                  <hr valign="center" border="0" style="border: none; height: 8px; background-image: linear-gradient(to right, #ed4036, #fbb513, #9bc955, #47c3d5, #5c92cd); margin: 10px 0px;">
                  <p style="font: 14px Roboto, Arial, sans-serif; text-align: center; margin: 10px 20px;">${fields.dateText}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        `}

        ${(() => {
          const editorHtml = (!fields.hideEditor && fields.editorParagraphs) ? `
          <!-- EDITOR'S NOTE -->
          <tr>
            <td style="padding: 20px; padding-top: 0px; background-color: #ffffff !important;">
              <table width="100%" style="border-spacing: 0" role="presentation">
                <tbody>
                  <tr>
                    <td align="center" style="text-align: center; vertical-align: middle; font-size: 0; background-color: #ffffff !important;">
                      
                      <div style="display: inline-block; width: 100%; max-width: 650px; vertical-align: middle; text-align: left;">
                        <table class="column" width="100%" role="presentation" style="border-spacing: 0">
                          <tbody>
                            <tr>
                              <td style="background-color: #ffffff !important; padding: 0; padding-right: 20px; font-family: Roboto, Arial, sans-serif; font-size: 14px; line-height: 1.5 !important; color: #334155; text-align: justify;">
                                ${fields.editorSalutation ? `<p style="font-size: 18px; margin-top: 0;"><b>${fields.editorSalutation}</b></p>` : ""}
                                ${editorNoteHtml}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>` : "";

          const topAdHtml = (!fields.hideTopAd && fields.topAdImg) ? `
          <!-- TOP SPONSOR AD -->
          <tr>
            <td style="padding: 8px 20px; padding-top: 0px; background-color: #ffffff !important;">
              <table width="100%" style="border-spacing: 0" role="presentation">
                <tbody>
                  <tr>
                    <td align="center" style="text-align: center; vertical-align: middle; font-size: 0; background-color: #ffffff !important;">
                      <div style="display: inline-block; width: 100%; max-width: 300px; vertical-align: middle; text-align: center;">
                        <table class="column" width="100%" role="presentation" style="border-spacing: 0">
                          <tbody>
                            <tr>
                              <td align="center" style="background-color: #ffffff !important; padding: 0 20px; padding-left: 0px;">
                                <a href="${fields.topAdUrl}" target="_blank" style="display: inline-block;">
                                  <img class="third-img-last" src="${fields.topAdImg}" width="300" height="250" alt="${fields.topAdAlt || ''}" style="display: block; width: 300px; height: 250px; border: 0;">
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>` : "";

          const leadStoryHtml = (!fields.hideLeadStory && (fields.leadStoryTitle || fields.leadStoryParagraphs)) ? `
          <!-- LEAD STORY -->
          <tr>
            <td style="padding: 0">
              <table width="100%" style="border-spacing: 0" role="presentation">
                <tbody>
                  <tr>
                    <td style="background-color: #ffffff !important; padding: 0px 20px;">
                      ${fields.leadTitleLabel ? `
                      <p style="text-align: center; background: #175e69; color: #fff; font: 16px Roboto, Arial, sans-serif; padding: 6px; margin-bottom: 0px; margin-top: 0px;">
                        <b>${fields.leadTitleLabel}</b>
                      </p>` : ""}
                      ${fields.leadImg ? `
                      <div class="lead-img-wrap" style="width: 100%; height: 100px;">
                        <img src="${fields.leadImg}" alt="${fields.leadStoryTitle || ''}" border="0" style="height: 100%; width: 100%; object-fit: cover; overflow: hidden;">
                      </div>` : ""}
                      <div style="padding: 2px;">
                        ${fields.leadStoryTitle ? `<p style="color: #334155; font-size: 22px; margin-bottom: 0px;"><b>${fields.leadStoryTitle}</b></p>` : ""}
                        ${fields.leadStoryAuthor ? `<p style="color: #334155; margin-top: 0px; font-size: 14px;"><i>- ${fields.leadStoryAuthor}</i></p>` : ""}
                        ${leadStoryNoteHtml}
                        ${(fields.leadStoryButtonText && fields.leadStoryButtonUrl) ? `
                        <div style="text-align: left; margin: 12px 0px 32px 0px;">
                          <a href="${fields.leadStoryButtonUrl}" target="_blank" style="display: inline-block; background: #175e69; color: #ffffff; font: 700 13px Roboto, Arial, sans-serif; text-decoration: none; padding: 9px 22px; border-radius: 20px; letter-spacing: 0.04em;">${fields.leadStoryButtonText}</a>
                        </div>` : ""}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>` : "";

          const hotTakesSectionHtml = (!fields.hideHotTakes && fields.hotTakesParagraphs) ? `
          <!-- HOT MARKETING TAKES -->
          <tr>
            <td style="background-color: #ffffff !important; padding: 0">
              <table width="100%" style="border-spacing: 0" role="presentation">
                <tbody>
                  <tr>
                    <td style="background-color: #ffffff !important; padding: 0px 20px;">
                      ${fields.hotTakesTitleLabel ? `
                      <p style="text-align: center; background: #f0493c; color: #fff; font: 16px Roboto, Arial, sans-serif; padding: 6px; margin-bottom: 0px; margin-top: 0px;">
                        <b>${fields.hotTakesTitleLabel}</b>
                      </p>` : ""}
                      ${fields.hotTakesImg ? `
                      <div class="lead-img-wrap" style="width: 100%; height: 100px;">
                        <img src="${fields.hotTakesImg}" alt="marketing takes" border="0" style="height: 100%; width: 100%; object-fit: cover; overflow: hidden;">
                      </div>` : ""}
                      <div style="padding: 20px 0px; text-align: justify;">
                        ${hotTakesHtml}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>` : "";

          const columnsHtml = (!fields.hideColumns && legacyGridItems.length > 0) ? `
          <!-- DYNAMIC COLUMN SECTION -->
          <tr>
            <td style="padding: 0; background-color: #ffffff !important;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0; background:#ffffff;">
                <tbody>
                  ${legacyGridRowsHtml}
                </tbody>
              </table>
            </td>
          </tr>` : "";

          const bottomAdHtml = (!fields.hideBottomAd && fields.bottomAdImg) ? `
          <!-- BOTTOM AD -->
          <tr>
            <td style="padding: 0; background-color: #ffffff !important;">
              <table width="100%" style="border-spacing: 0" role="presentation">
                <tbody>
                  <tr>
                    <td style="padding: 8px 20px 8px 20px; background-color: #ffffff !important;" align="center">
                      <a href="${fields.bottomAdUrl}" target="_blank" style="text-decoration: none; display: inline-block">
                        <img src="${fields.bottomAdImg}" alt="${fields.bottomAdAlt || ''}" border="0" width="300" height="250" style="display: block; width: 100%; max-width: 300px; height: auto;">
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>` : "";

          const pollHtml = (!fields.hidePollSection && fields.pollQuestion) ? `
          <!-- WEEKLY POLL -->
          <tr>
            <td style="padding: 0; background-color: #ffffff !important;">
              <!-- POLL OF THE WEEK -->
              <table width="100%" role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tbody>
                  <tr>
                    <td align="center" style="padding: 0 20px 30px 20px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 420px; background:#f8fafc; border-radius:22px;">
                        <tbody>
                          ${fields.pollTitle ? `
                          <tr>
                            <td align="center" style="padding-top: 10px;">
                              <span style="display:inline-block; color:#f0493c; font:16px Roboto, Arial, sans-serif; padding:10px;">
                                <b>${fields.pollTitle}</b>
                              </span>
                            </td>
                          </tr>` : ""}
                          <tr>
                            <td align="center" style="padding: 10px;">
                              <h3 style="margin:0; font:14px Roboto, Arial, sans-serif; color:#0f172a;">
                                ${fields.pollQuestion}
                              </h3>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 20px 80px;">
                              ${fields.pollChoices && fields.pollChoices.length > 0 ? 
                                fields.pollChoices.filter(choice => choice.text && choice.text.trim() !== "").map((choice, index, arr) => `
                              <a href="${choice.url || "#"}" target="_blank" style="display:block; padding:12px 14px; ${index < arr.length - 1 ? 'margin-bottom:10px;' : ''} background:#ffffff; border:1px solid #cbd5f5; border-radius:10px; text-decoration:none; color:#334155; font:12px Roboto, Arial, sans-serif;">
                                <span style="display:inline-block; width:14px; height:14px; border:2px solid #94a3b8; border-radius:50%; vertical-align:-3px; margin-right:10px;"></span>
                                ${choice.text}
                              </a>`).join("\n")
                              : `
                              ${fields.pollChoice1 ? `
                              <a href="${fields.pollChoice1Url}" target="_blank" style="display:block; padding:12px 14px; margin-bottom:10px; background:#ffffff; border:1px solid #cbd5f5; border-radius:10px; text-decoration:none; color:#334155; font:12px Roboto, Arial, sans-serif;">
                                <span style="display:inline-block; width:14px; height:14px; border:2px solid #94a3b8; border-radius:50%; vertical-align:-3px; margin-right:10px;"></span>
                                ${fields.pollChoice1}
                              </a>` : ""}
                              ${fields.pollChoice2 ? `
                              <a href="${fields.pollChoice2Url}" target="_blank" style="display:block; padding:12px 14px; margin-bottom:10px; background:#ffffff; border:1px solid #cbd5f5; border-radius:10px; text-decoration:none; color:#334155; font:12px Roboto, Arial, sans-serif;">
                                <span style="display:inline-block; width:14px; height:14px; border:2px solid #94a3b8; border-radius:50%; vertical-align:-3px; margin-right:10px;"></span>
                                ${fields.pollChoice2}
                              </a>` : ""}
                              ${fields.pollChoice3 ? `
                              <a href="${fields.pollChoice3Url}" target="_blank" style="display:block; padding:12px 14px; margin-bottom:10px; background:#ffffff; border:1px solid #cbd5f5; border-radius:10px; text-decoration:none; color:#334155; font:12px Roboto, Arial, sans-serif;">
                                <span style="display:inline-block; width:14px; height:14px; border:2px solid #94a3b8; border-radius:50%; vertical-align:-3px; margin-right:10px;"></span>
                                ${fields.pollChoice3}
                              </a>` : ""}
                              ${fields.pollChoice4 ? `
                              <a href="${fields.pollChoice4Url}" target="_blank" style="display:block; padding:12px 14px; background:#ffffff; border:1px solid #cbd5f5; border-radius:10px; text-decoration:none; color:#334155; font:12px Roboto, Arial, sans-serif;">
                                <span style="display:inline-block; width:14px; height:14px; border:2px solid #94a3b8; border-radius:50%; vertical-align:-3px; margin-right:10px;"></span>
                                ${fields.pollChoice4}
                              </a>` : ""}`}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>` : "";

          const sectionsMap: Record<string, string> = {
            editor: editorHtml,
            topAd: topAdHtml,
            leadStory: leadStoryHtml,
            hotTakes: hotTakesSectionHtml,
            columns: columnsHtml,
            bottomAd: bottomAdHtml,
            poll: pollHtml
          };

          const activeSequence = fields.sectionsOrder || ["editor", "topAd", "leadStory", "hotTakes", "columns", "bottomAd", "poll"];
          const activeFragments = activeSequence
            .map(key => sectionsMap[key])
            .filter(html => html && html.trim() !== "");

          return activeFragments.join(`
          <tr>
            <td align="center">
              <hr valign="center" border="0" style="border: none; height: 1px; background-image: linear-gradient(to right, #ed4036, #fbb513, #9bc955, #47c3d5, #5c92cd); margin: 20px 20px;">
            </td>
          </tr>
          `);
        })()}

        ${fields.hideFooter ? "" : `
        <!-- FORWARD -->
        <table width="100%" style="border-spacing: 0; margin-top: 20px;" role="presentation">
          <tbody>
            <tr>
              <td style="padding: 15px; text-align: center; background: #2a5a8d;" align="center">
                <h3 style="font-weight: normal; font-size: 16px; line-height: 1.5 !important; color: #fff; margin: 0 0 10px 0;">
                  Was this email forwarded to you?
                </h3>
                <p style="margin: auto; color: #fff;">
                  <a href="${fields.signupUrl}" target="_blank" style="text-decoration: none; color: #fff;"><b>Subscribe to the HCM Sales and Marketing Excellence Newsletter</b></a>
                </p>
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #fff;">
                  (Just log in with your free HR.com account)
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        <hr valign="center" border="0" style="border: none; height: 8px; background-image: linear-gradient(to right, #ed4036, #fbb513, #9bc955, #47c3d5, #5c92cd); margin: 10px 0px;">

        <!-- FOOTER -->
        <table width="100%" style="border-spacing: 0" role="presentation">
          <tbody>
            <tr>
              <td align="center" style="padding: 20px 24px 8px 24px; text-align: center; background-color: #ffffff !important;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto">
                  <tbody>
                    <tr>
                      ${fields.footerFacebookUrl ? `
                      <td align="center" style="padding: 0 2px; background-color: #ffffff !important;">
                        <a href="${fields.footerFacebookUrl}" target="_blank"><img src="https://public-cdn.hr.com/remoteimages/website-images/2025_siteupdate/community-emailer/facebook.png" width="24" height="24" alt="Facebook" style="display: block; border: 0; width: 24px; height: 24px;"></a>
                      </td>` : ""}
                      ${fields.footerLinkedinUrl ? `
                      <td align="center" style="padding: 0 2px; background-color: #ffffff !important;">
                        <a href="${fields.footerLinkedinUrl}" target="_blank"><img src="https://public-cdn.hr.com/remoteimages/website-images/2025_siteupdate/community-emailer/linkedin.png" width="24" height="24" alt="LinkedIn" style="display: block; border: 0; width: 24px; height: 24px;"></a>
                      </td>` : ""}
                      ${fields.footerInstagramUrl ? `
                      <td align="center" style="padding: 0 2px; background-color: #ffffff !important;">
                        <a href="${fields.footerInstagramUrl}" target="_blank"><img src="https://public-cdn.hr.com/remoteimages/website-images/2025_siteupdate/community-emailer/instagram.png" width="24" height="24" alt="Instagram" style="display: block; border: 0; width: 24px; height: 24px;"></a>
                      </td>` : ""}
                      ${fields.footerYoutubeUrl ? `
                      <td align="center" style="padding: 0 2px; background-color: #ffffff !important;">
                        <a href="${fields.footerYoutubeUrl}" target="_blank"><img src="https://public-cdn.hr.com/remoteimages/website-images/2025_siteupdate/community-emailer/youtube.png" width="24" height="24" alt="YouTube" style="display: block; border: 0; width: 24px; height: 24px;"></a>
                      </td>` : ""}
                      ${fields.footerTwitterUrl ? `
                      <td align="center" style="padding: 0 2px; background-color: #ffffff !important;">
                        <a href="${fields.footerTwitterUrl}" target="_blank"><img src="https://public-cdn.hr.com/remoteimages/website-images/2025_siteupdate/community-emailer/x.png" width="24" height="24" alt="X" style="display: block; border: 0; width: 24px; height: 24px;"></a>
                      </td>` : ""}
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 35px 20px 6px 20px; text-align: center; background-color: #ffffff !important;">
                <p style="margin: 0; max-width: 450px; margin: 0 auto; font-size: 14px; line-height: 1.5 !important;">
                  ${fields.footerClosingText}
                </p>
                <a href="${fields.footerSubscribeUrl}" target="_blank" style="display: block; text-transform: uppercase; text-decoration: none; padding-top: 20px;">
                  <b>${fields.footerSubscribeText}</b>
                </a>
                <p style="margin: 0; font: 10px Roboto, Arial, sans-serif; color: #334155; padding-top: 10px; padding-bottom: 10px;">
                  <a href="${fields.footerUnsubscribeUrl}" target="_blank" style="color: #1e40af; text-decoration: underline; font-size: 10px;">Unsubscribe</a> |
                  <a href="${fields.footerManageSubscriptionUrl}" target="_blank" style="color: #1e40af; text-decoration: underline; font-size: 10px;">Manage Subscription</a> |
                  <a href="${fields.footerAdvertiseUrl}" target="_blank" style="color: #1e40af; text-decoration: underline; font-size: 10px;">Advertise with us</a> |
                  <a href="${fields.footerPrivacyPolicyUrl}" target="_blank" style="color: #1e40af; text-decoration: underline; font-size: 10px;">Privacy Policy</a> |
                  <a href="${fields.footerContactUsUrl}" target="_blank" style="color: #1e40af; text-decoration: underline; font-size: 10px;">Contact Us</a>
                </p>
                <p style="margin: 0; font: 10px Roboto, Arial, sans-serif; color: #334155; padding-bottom: 20px;">
                  ${fields.footerCopyrightText}
                </p>
                <p style="color: #334155; max-width: 450px; margin: 0 auto; text-align: center; padding-bottom: 20px; font-size: 10px;">
                  ${fields.footerDisclaimerText}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        `}

      </table>
    </div>
  </div>
</body>
</html>`;
}
