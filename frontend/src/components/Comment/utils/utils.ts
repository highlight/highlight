import {
    Maybe,
    SanitizedSlackChannel,
    SanitizedSlackChannelInput,
} from '@graph/schemas';
import * as Types from '@graph/schemas';
import { MentionItem } from '@highlight-run/react-mentions';

export function filterMentionedAdmins(
    admins: Maybe<
        { __typename?: 'Admin' } & Pick<
            Types.Admin,
            'id' | 'name' | 'email' | 'photo_url'
        >
    >[],
    mentions: MentionItem[]
) {
    return mentions
        .filter(
            (mention) =>
                !mention.display.includes('@') && !mention.display.includes('#')
        )
        .map((mention) => {
            const admin = admins?.find((admin) => {
                return admin?.id === mention.id;
            });
            return { id: mention.id, email: admin?.email || '' };
        });
}

export function filterMentionedSlackUsers(
    slackMembers: Maybe<SanitizedSlackChannel>[],
    mentions: MentionItem[]
) {
    return mentions
        .filter(
            (mention) =>
                mention.display.includes('@') || mention.display.includes('#')
        )
        .map<SanitizedSlackChannelInput>((mention) => {
            const matchingSlackUser = slackMembers.find((slackUser) => {
                return slackUser?.webhook_channel_id === mention.id;
            });

            return {
                webhook_channel_id: matchingSlackUser?.webhook_channel_id,
                webhook_channel_name: matchingSlackUser?.webhook_channel,
            };
        });
}
