// Auto-approve screen: what goes live on its own and what waits for Alejandro.
// Cases are shaped like real submissions from Aug-Nov 2026.
// Run: npx tsx --test tests/moderation.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  screenListing, checkSpotlightDraft, quotedPassages, websiteHost, isSharedHost,
  DAILY_AUTO_APPROVE_CAP, type ScreenContext,
} from '../lib/moderation/screen';

const quiet: ScreenContext = { submissionsLast24h: 1, related: [] };
const school = {
  name: 'Tarang Yoga Ashram & School',
  type: 'school',
  email: 'tarangyoga@gmail.com',
  website: 'https://tarangyogaschool.com',
  description: 'A traditional yoga school in Rishikesh offering 200 hour teacher training and retreats.',
};

test('a normal yoga school goes live', () => {
  assert.deepEqual(screenListing(school, quiet), []);
});

test('wide topic net: pilates, tai chi and harmonium makers pass', () => {
  for (const [name, description] of [
    ['Pilates Academy Arjan', 'Reformer and mat classes for every level in Dubai Marina.'],
    ['Taichi Walking', 'Gentle walking practice that blends tai chi movement with breath.'],
    ['RagaLoom', 'Hand built harmoniums and shruti boxes for kirtan and practice.'],
  ]) {
    assert.deepEqual(screenListing({ ...school, name, description, website: null }, quiet), [], name);
  }
});

test('off-topic listing is held', () => {
  const reasons = screenListing(
    { ...school, name: 'Epoxy Floor Pros', website: 'https://epoxyfloorpros.com', description: 'Garage floor coating and concrete polishing for homes and shops.' },
    quiet
  );
  assert.equal(reasons.length, 1);
  assert.match(reasons[0], /yoga, meditation or wellness/);
});

test('spam words are held even on a yoga listing, whole words only', () => {
  const spam = screenListing({ ...school, description: `${school.description} Best online casino bonus and backlinks.` }, quiet);
  assert.match(spam.join(' '), /casino, backlinks/);
  // "Slotsky" or "Vapenburg" must not trip the word list
  assert.deepEqual(screenListing({ ...school, description: 'Yoga in Vapenburg with Anna Slotsky, cryptomeria forest retreat.' }, quiet), []);
});

test('missing or thin description is held', () => {
  assert.match(screenListing({ ...school, description: '' }, quiet).join(' '), /no description/);
  assert.match(screenListing({ ...school, description: 'Yoga classes.' }, quiet).join(' '), /only a few words/);
});

test('link stuffing and markup are held', () => {
  const links = screenListing({ ...school, description: `${school.description} https://a.example https://b.example` }, quiet);
  assert.match(links.join(' '), /more than one web link/);
  const html = screenListing({ ...school, description: `${school.description} <a href="x">yoga</a>` }, quiet);
  assert.match(html.join(' '), /link or script code/);
});

test('same website and type as an existing listing is held; another type is not', () => {
  const dup = { name: 'Samadhi Yoga Ashram', type: 'school', status: 'approved', sameHost: true, sameEmail: false };
  assert.match(screenListing(school, { ...quiet, related: [dup] }).join(' '), /Possible duplicate/);
  assert.deepEqual(screenListing(school, { ...quiet, related: [{ ...dup, type: 'retreat' }] }), []);
});

test('a school can list many workshops; the same workshop twice is held', () => {
  const workshop = { ...school, name: 'Aerial Yoga CPD Weekend', type: 'workshop', website: 'https://coachhouse.example/aerial-cpd' };
  const other = { name: 'Restorative Yoga CPD Day', type: 'workshop', status: 'approved', sameHost: true, sameEmail: true };
  assert.deepEqual(screenListing(workshop, { ...quiet, related: [other] }), []);
  const same = { ...other, name: 'aerial  yoga CPD weekend' };
  assert.match(screenListing(workshop, { ...quiet, related: [same] }).join(' '), /Possible duplicate/);
});

test('booking platforms are shared hosts', () => {
  for (const h of ['bookwhen.com', 'www.eventbrite.co.uk', 'eventbrite.com', 'momoyoga.com']) {
    assert.equal(isSharedHost(h.replace(/^www\./, '')), true, h);
  }
  assert.equal(isSharedHost('coachhousestudio.uk'), false);
});

test('a sender he rejected before is held', () => {
  const rejected = { name: '200 Hour Yoga Course Rishikesh', type: 'product', status: 'rejected', sameHost: true, sameEmail: false };
  assert.match(screenListing(school, { ...quiet, related: [rejected] }).join(' '), /You rejected/);
});

test('a flood of submissions holds everything', () => {
  assert.deepEqual(screenListing(school, { ...quiet, submissionsLast24h: DAILY_AUTO_APPROVE_CAP }), []);
  assert.match(screenListing(school, { ...quiet, submissionsLast24h: DAILY_AUTO_APPROVE_CAP + 1 }).join(' '), /far more than usual/);
});

test('throwaway email is held', () => {
  assert.match(screenListing({ ...school, email: 'x@mailinator.com' }, quiet).join(' '), /throwaway/);
});

test('website host helpers', () => {
  assert.equal(websiteHost('https://www.Ekattvayogshala.com/retreats'), 'ekattvayogshala.com');
  assert.equal(websiteHost('not a url'), null);
  assert.equal(isSharedHost('youtube.com'), true);
  assert.equal(isSharedHost('m.facebook.com'), true);
  assert.equal(isSharedHost('ekattvayogshala.com'), false);
});

// ── spotlight drafts ─────────────────────────────────────────────────────────

const story = {
  origin: 'I came to yoga after a back injury left me unable to sit at my desk for more than an hour. A friend dragged me to a class and I never left.',
  leap: 'I opened the studio when my teacher retired and the room was about to become a phone shop. Someone had to keep the lights on.',
  hard_truth: 'Nobody sees the 5am cleaning, the empty classes in January, or the months I paid the rent from my savings.',
};
const source = { name: 'Unity Yoga', description: 'A neighbourhood studio.', founder_story: story };
const filler = Array.from({ length: 480 }, () => 'practice').join(' ');
const goodDraft = {
  title: 'Welcome to the Network: Unity Yoga',
  content: `Welcome to Unity Yoga.\n\n“A friend dragged me to a class and I never left.”\n\n![Unity Yoga](https://x.example/a.jpg)\n\nShe says "Nobody sees the 5am cleaning, the empty classes in January... the months I paid the rent from my savings."\n\n${filler}`,
  pull_quote: 'Someone had to keep the lights on.',
};

test('a draft that quotes the founder word for word publishes', () => {
  assert.deepEqual(checkSpotlightDraft(goodDraft, source), []);
});

test('an invented quote holds the draft', () => {
  const draft = { ...goodDraft, content: goodDraft.content.replace('A friend dragged me to a class and I never left.', 'Yoga saved my life and I knew I had to share it.') };
  assert.match(checkSpotlightDraft(draft, source).join(' '), /1 quote is not word for word/);
});

test('a pull quote that is not in the answers holds the draft', () => {
  assert.match(checkSpotlightDraft({ ...goodDraft, pull_quote: 'Yoga is my whole life.' }, source).join(' '), /pull quote/);
  assert.match(checkSpotlightDraft({ ...goodDraft, pull_quote: null }, source).join(' '), /pull quote/);
});

test('title rules: pattern and no "story"', () => {
  assert.match(checkSpotlightDraft({ ...goodDraft, title: 'Unity Yoga joins us' }, source).join(' '), /title does not follow/);
  assert.match(checkSpotlightDraft({ ...goodDraft, title: 'Member Spotlight: the Unity Yoga story' }, source).join(' '), /title uses the word "story"/);
});

test('"story" in the body holds, unless the founder said it', () => {
  assert.match(checkSpotlightDraft({ ...goodDraft, content: `${goodDraft.content} This is her story.` }, source).join(' '), /outside a quote/);
  const said = { ...source, founder_story: { ...story, leap: `${story.leap} That is the whole story of this place.` } };
  const draft = { ...goodDraft, content: `${goodDraft.content} “That is the whole story of this place.”` };
  assert.deepEqual(checkSpotlightDraft(draft, said), []);
});

test('thin answers, short posts, emoji and links hold', () => {
  const thin = { ...source, founder_story: { origin: 'I love yoga.', leap: 'I wanted to.', hard_truth: 'Money.' } };
  assert.match(checkSpotlightDraft({ ...goodDraft, pull_quote: 'I love yoga.' }, thin).join(' '), /wrote very little/);
  assert.match(checkSpotlightDraft({ ...goodDraft, content: 'Welcome. Short.' }, source).join(' '), /words \(expected/);
  assert.match(checkSpotlightDraft({ ...goodDraft, content: `${goodDraft.content} \u{1F9D8}` }, source).join(' '), /emoji/);
  const linked = { ...source, founder_story: { ...story, origin: `${story.origin} Visit https://cheap.example now.` } };
  assert.match(checkSpotlightDraft(goodDraft, linked).join(' '), /web link/);
});

test('quotedPassages ignores image lines and short quoted words', () => {
  assert.deepEqual(quotedPassages('![a "quoted" alt that is long enough to count](https://x/y.jpg) the "flow" class'), []);
});
