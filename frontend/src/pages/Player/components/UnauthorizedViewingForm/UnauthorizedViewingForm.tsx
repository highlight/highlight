import { useAuthContext } from '@authentication/AuthContext';
import Button from '@components/Button/Button/Button';
import FullBleedCard from '@components/FullBleedCard/FullBleedCard';
import Input from '@components/Input/Input';
import { useReplayerContext } from '@pages/Player/ReplayerContext';
import Lottie from 'lottie-react';
import React, { useState } from 'react';

import WaitingAnimation from '../../../../lottie/waiting.json';

const UnauthorizedViewingForm = () => {
    const { admin } = useAuthContext();
    const [reason, setReason] = useState('');
    const { viewingUnauthorizedSession, setViewingUnauthorizedSession } =
        useReplayerContext();

    if (!viewingUnauthorizedSession) {
        return null;
    }

    return (
        <FullBleedCard
            title="STOP RIGHT THERE!"
            animation={<Lottie animationData={WaitingAnimation} />}
        >
            <p>
                Hey {admin?.name || admin?.email}, have you checked with the
                customer that you're allowed to view this session?
            </p>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setViewingUnauthorizedSession(false);
                }}
            >
                <label htmlFor="reason">
                    Reason for viewing customer session
                    <Input
                        id="reason"
                        type="text"
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                        }}
                        placeholder="Debugging customer issue"
                    />
                </label>

                <Button
                    disabled={reason.length < 5}
                    trackingId="ViewingCustomerSession"
                    trackProperties={{ reason }}
                    htmlType="submit"
                    type="primary"
                >
                    View Session
                </Button>
            </form>
        </FullBleedCard>
    );
};

export default UnauthorizedViewingForm;
