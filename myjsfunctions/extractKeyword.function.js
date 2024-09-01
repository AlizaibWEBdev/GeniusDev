import axios from 'axios';
import * as cheerio from 'cheerio';

async function extractKeywords(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        // Extract and analyze the title, meta description, and headers
        const title = $('title').text().trim();
        const metaDescription = $('meta[name="description"]').attr('content') || '';
        const headers = {};
        $('h1, h2, h3, h4, h5, h6').each((_, el) => {
            const tag = $(el).get(0).tagName;
            headers[tag] = headers[tag] || [];
            headers[tag].push($(el).text().trim());
        });

        // Extract text content and count word frequency
        const text = $('body').text().toLowerCase();
        const words = text.match(/\b\w+\b/g);
        const wordCounts = {};

        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });

        // Sort words by frequency
        const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);

        // Extract the top 30 keywords
        const top30Keywords = sortedWords.slice(0, 30).map(([word, count]) => ({ word, count }));

        // Extract short-tail and long-tail keywords
        const shortTailKeywords = [];
        const longTailKeywords = [];

        for (let [word, count] of sortedWords) {
            if (word.length <= 3) continue;
            if (word.split(' ').length === 1) {
                shortTailKeywords.push({ word, count });
            } else if (word.split(' ').length > 1) {
                longTailKeywords.push({ word, count });
            }
        }

        // Calculate keyword density
        const totalWords = words.length;
        const uniqueWords = Object.keys(wordCounts).length;
        const keywordDensity = {};

        top30Keywords.forEach(({ word, count }) => {
            keywordDensity[word] = ((count / totalWords) * 100).toFixed(2) + '%';
        });

        // Analyze keyword placement in strategic locations
        const keywordPlacement = {
            inTitle: top30Keywords.filter(k => title.toLowerCase().includes(k.word)),
            inMetaDescription: top30Keywords.filter(k => metaDescription.toLowerCase().includes(k.word)),
            inHeaders: top30Keywords.filter(k => Object.values(headers).flat().join(' ').toLowerCase().includes(k.word)),
        };

        // Analyze content structure
        const paragraphCount = $('p').length;
        const imageCount = $('img').length;
        const listCount = $('ul, ol').length;
        const tableCount = $('table').length;

        // Analyze internal and external links
        const internalLinks = [];
        const externalLinks = [];
        $('a').each((_, el) => {
            const href = $(el).attr('href');
            if (href) {
                if (href.startsWith(url) || href.startsWith('/')) {
                    internalLinks.push(href);
                } else {
                    externalLinks.push(href);
                }
            }
        });

        // Keyword diversity
        const keywordDiversity = uniqueWords / totalWords;

        return {
            url,
            title,
            metaDescription,
            headers,
            totalWords,
            uniqueWords,
            top30Keywords,
            shortTailKeywords,
            longTailKeywords,
            keywordDensity,
            keywordPlacement,
            contentStructure: {
                paragraphCount,
                imageCount,
                listCount,
                tableCount
            },
            links: {
                internalLinksCount: internalLinks.length,
                externalLinksCount: externalLinks.length,
                internalLinks,
                externalLinks
            },
            keywordDiversity: keywordDiversity.toFixed(2)
        };

    } catch (error) {
        console.error('Error fetching the URL:', error);
        return { error: 'Failed to fetch the URL' };
    }
}

export default extractKeywords;

