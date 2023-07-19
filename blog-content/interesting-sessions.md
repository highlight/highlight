---
title: Interesting Sessions with Markov Chains
createdAt: 2023-07-20T00:00:00Z
readingTime: 6
authorFirstName: Zane
authorLastName: Mayberry
authorTitle: Software Engineer @ Highlight 
authorTwitter: ''
authorWebsite: ''
authorLinkedIn: 'https://www.linkedin.com/in/zane-mayberry-688161165/'
authorGithub: 'https://github.com/mayberryzane'
authorPFP: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FvrMpBimsRzOGGJSWWppg&w=1920&q=75'
tags: Launch Week 2
metaTitle: Interesting Sessions with Markov Chains
---
At Highlight, we wanted to identify and summarize interesting user sessions to make it easier for our customers understand their users. One way to analyze a session is to look at the user’s journey, summarized by the order of page visits and the time spent per page. The thought is that sessions with unusual user journeys would uncover insights into how users may be experiencing frustration or using the app in an unexpected way. 

## Capturing the user journey

The Highlight client records browser navigation events, so we can get the URLs and timestamps for each page visit. Conceptually, a page is a bit different from a URL, since one or many URLs may map to a single page. An app may use URL normalization rules (e.g. case insensitivity, or removing trailing slashes). For most apps, query parameters don’t change which page is rendered, just which content is displayed or how that content is rendered. Similarly, for dynamic routing, a routing scheme could include one or more resource IDs in the URLs’ paths. For example, in Highlight, errors details can be viewed at `app.highlight.io/\{project-id\}/errors/\{error-id\}`, but regardless of the `project-id` and `error-id` in the URL, we render the same “error details page” with different content displayed.

## Normalizing our data

To reduce noise, we wanted to apply some normalization steps before saving a session’s user journey. A web app may have some redirection logic, such that between two page visits, there is an intermediate visit to another page. This doesn’t really impact the user journey, so we can just discard the intermediate page. To try our best to group URLs together as pages, we needed to identify resource IDs in URLs - we wanted an algorithm that would split up a URL and identify which parts are likely IDs so we could remove them. There isn’t a single way to accomplish this, but we ended up splitting the URL paths on their slashes, and handling each part with a few heuristics that work pretty well for our use case:

- If the part contains a number, treat the part as an ID.
- Split the part on capitals or separator characters (’-’, ‘_’, ‘~’, ‘+’). If any of these doesn’t contain a vowel or contains more than 5 sequential consonants, treat the part as an ID.

There are a few cases where this heuristic won’t work. IDs generated from dictionary words (e.g. “diamond-hamburger-board”) will be treated as separate pages. And any static pages with numbers or strings of consonants (e.g. in acronyms) will be treated as IDs. Both of these situations won’t have a huge impact for most apps, but will add some noise to the results. A better approach may look back at previous journeys to merge similar URLs, but this can have issues too, e.g. for handling new pages.

## Scoring interesting sessions

After applying these normalization steps, we can enumerate all of the state transitions in a user journey. For each step in the journey, we can calculate the bigram probability of the next url given the current url using all of the other sessions we’ve seen, creating a [Markov chain](https://en.wikipedia.org/wiki/Markov_chain). An interesting session should be one where the state transitions are less probable. For a Highlight user session, an example journey with its corresponding probabilities looks like this:

| page | next_page | probability |
| --- | --- | --- |
| START | /\{id-1\}/sessions/\{id-2\} | 0.226 |
| /\{id-1\}/sessions/\{id-2\} | /\{id-1\}/errors/\{id-2\} | 0.0215 |
| /\{id-1\}/errors/\{id-2\} | /\{id-1\}/errors/\{id-2\}/instances/\{id-3\} | 0.0515 |
| /\{id-1\}/errors/\{id-2\}/instances/\{id-3\} | /\{id-1\}/sessions | 0.0606 |
| /\{id-1\}/sessions | /\{id-1\}/sessions/\{id-2\} | 0.479 |
| /\{id-1\}/sessions/\{id-2\} | END | 0.688 |

We can calculate the probability of the entire session by multiplying each step's probability together. In the above example, we get a total probability of `5.01x10^-6`. This is the probability of that exact user journey happening, assuming at each step that the next page was randomly chosen based only on the current page. We could calculate this probability for all sessions, then find the sessions with the lowest probability. This has a couple of issues though:

- Longer sessions will be favored, because probabilities are multiplied together and the probability of every step cannot be greater than 1.
- Navigation among pages of an app with many links to other pages will cause lower scores, as the expected probability is lower. For example, for a current page, if there are five other pages a user can visit and each is equally interesting (equal probability), the step’s probability will be `.2` regardless of which page is chosen (and in this example, each page is equally “interesting”, so the transition shouldn’t affect the overall “interestingness”).

To solve these issues, we can normalize the probabilities such that the expected value for each state transition is 1. For the first issue, regardless of how many transitions are made, the expected value of an entire session is 1. For the second issue, all transitions are scored as 1 instead of .2. High probability steps will now have a normalized score greater than 1, and the total score of a session will be less than 1 if it’s more interesting and greater than 1 if it’s less interesting. Applying this normalization to the previous example looks like this:

| page | next_page | normalized |
| --- | --- | --- |
| START | /\{id-1\}/sessions/\{id-2\} | 1.53 |
| /\{id-1\}/sessions/\{id-2\} | /\{id-1\}/errors/\{id-2\} | 0.0424 |
| /\{id-1\}/errors/\{id-2\} | /\{id-1\}/errors/\{id-2\}/instances/\{id-3\} | 0.275 |
| /\{id-1\}/errors/\{id-2\}/instances/\{id-3\} | /\{id-1\}/sessions | 0.221 |
| /\{id-1\}/sessions | /\{id-1\}/sessions/\{id-2\} | 1.77 |
| /\{id-1\}/sessions/\{id-2\} | END | 1.34 |

The query for generating these normalized scores:

```sql
with frequencies as (
    select page, next_page, count(*)
    from user_journey_steps
    where created_at > now() - interval '30 days'
    and project_id = 1
    group by 1, 2)
select u.index, u.page, u.next_page,
    sum(case when f.page = u.page and f.next_page = u.next_page then count else 0 end)
        * (sum(case when f.page = u.page then count else 0 end))
        / sum((case when f.page = u.page then count else 0 end) ^ 2) as normalized
from frequencies f
inner join user_journey_steps u
on f.page = u.page or f.next_page = u.next_page
where u.session_id = 259500567
group by u.session_id, index
order by u.session_id, index
```

We can calculate this score when a session is completed and save the value so that we can sort on it to find the most interesting sessions later on. We’re using this score for our new “session insights” email digest, a weekly summary of the most interesting sessions in a project. We want this digest to help Highlight users find interesting behaviors in their apps they might not yet be aware of.
