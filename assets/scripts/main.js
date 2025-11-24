/*
    Name: assets/scripts/main.js
    File Created: Oct 20th, 2025
    Last Updated: Oct 25th, 2025

    Copyright (c) 2007-2025 MDW. All rights reserved.
*/

function timeSince(dateString) {
    const now = new Date();
    const start = new Date(dateString);

    // Calculate total months between the two dates
    let totalMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    let adjustedStart = new Date(start);
    adjustedStart.setMonth(start.getMonth() + totalMonths);

    // Calculate remaining days
    let days = now.getDate() - adjustedStart.getDate();
    if (days < 0) {
        totalMonths--;
        adjustedStart.setMonth(adjustedStart.getMonth() - 1);
        days = Math.floor((now - adjustedStart) / (1000 * 60 * 60 * 24));
    }

    // Derive years, months, days
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    // Helper for singular/plural
    const pluralize = (value, word) => `${value} ${word}${value < 2 ? '' : 's'}`;

    // Build output
    const parts = [];
    if (years > 0) parts.push(pluralize(years, 'year'));
    if (months > 0) parts.push(pluralize(months, 'month'));
    if (days > 0 || parts.length === 0) parts.push(pluralize(days, 'day'));

    // Combine with commas and 'and'
    if (parts.length > 1) {
        return parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1];
    } else {
        return parts[0];
    }
}

function getAgeYears(dateString) {
    const now = new Date();
    const start = new Date(dateString);

    let age = now.getFullYear() - start.getFullYear();
    const hasHadBirthdayThisYear =
        now.getMonth() > start.getMonth() ||
        (now.getMonth() === start.getMonth() && now.getDate() >= start.getDate());

    if (!hasHadBirthdayThisYear) {
        age--;
    }

    return age;
}

function newWorkExp(role, link, linkDisplayName, joinDate, preposition = "on") {
    const duration = timeSince(joinDate);
    return `${role} ${preposition} <a href="${link}" rel="nofollow">${linkDisplayName}</a> <i>(Joined ${duration} ago)</i>`;
}

async function loadBio() {
    const response = await fetch("bio.txt");
    let text = await response.text();

    const funcPattern = /\{([a-zA-Z_]\w*)\(([^)]*)\)\}/g;

    text = text.replace(funcPattern, (match, funcName, argsRaw) => {
        try {
            const args = argsRaw
                .split(",")
                .map(a => a.trim().replace(/^["']|["']$/g, "")) // remove quotes
                .filter(a => a.length > 0);

            if (typeof window[funcName] === "function") {
                return window[funcName].apply(null, args);
            } else {
                console.warn(`Function "${funcName}" not found.`);
                return match;
            }
        } catch (e) {
            console.error(`Error evaluating ${match}:`, e);
            return match;
        }
    });

    return text.trim();
}
