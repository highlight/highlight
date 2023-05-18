package webrtc

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/base64"
	"encoding/json"
	"github.com/go-chi/chi"
	"github.com/pion/webrtc/v3"
	log "github.com/sirupsen/logrus"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"time"

	"github.com/at-wat/ebml-go/webm"
	"github.com/olahol/melody"
	"github.com/pion/rtcp"
	"github.com/pion/rtp"
	"github.com/pion/rtp/codecs"
	"github.com/pion/webrtc/v3/pkg/media/samplebuilder"
)

// Allows compressing offer/answer to bypass terminal input limits.
const compress = false

// Encode encodes the input in base64
// It can optionally zip the input before encoding
func Encode(obj interface{}) string {
	b, err := json.Marshal(obj)
	if err != nil {
		panic(err)
	}

	if compress {
		b = zip(b)
	}

	return base64.StdEncoding.EncodeToString(b)
}

// Decode decodes the input from base64
// It can optionally unzip the input after decoding
func Decode(in string, obj interface{}) {
	b, err := base64.StdEncoding.DecodeString(in)
	if err != nil {
		panic(err)
	}

	if compress {
		b = unzip(b)
	}

	err = json.Unmarshal(b, obj)
	if err != nil {
		panic(err)
	}
}

func zip(in []byte) []byte {
	var b bytes.Buffer
	gz := gzip.NewWriter(&b)
	_, err := gz.Write(in)
	if err != nil {
		panic(err)
	}
	err = gz.Flush()
	if err != nil {
		panic(err)
	}
	err = gz.Close()
	if err != nil {
		panic(err)
	}
	return b.Bytes()
}

func unzip(in []byte) []byte {
	var b bytes.Buffer
	_, err := b.Write(in)
	if err != nil {
		panic(err)
	}
	r, err := gzip.NewReader(&b)
	if err != nil {
		panic(err)
	}
	res, err := ioutil.ReadAll(r)
	if err != nil {
		panic(err)
	}
	return res
}

type Message struct {
	Candidate   *webrtc.ICECandidateInit   `json:"candidate,omitempty"`
	Description *webrtc.SessionDescription `json:"description,omitempty"`
}

func Listen(ctx context.Context, r chi.Router) {
	// TODO(vkorolik) build a connection map that associates a session, html element, id with the file and saver, and tracks the connection until it closes
	saver := newWebmSaver()
	pc, err := createConn(ctx, saver)
	// TODO(vkorolik) multiplex connections
	log.WithContext(ctx).WithError(err).Info("created 1 webrtc connection")
	// TODO(vkorolik) defer to separate close event?
	//if err := peerConnection.Close(); err != nil {
	//	panic(err)
	//}
	//saver.Close(ctx)
	m := melody.New()
	// allow larger messages as the webrtc signaling data is large
	m.Config.MaxMessageSize = 2 << 16
	// TODO(vkorolik)
	m.Upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	// Set the handler for ICE connection state
	// This will notify you when the peer has connected/disconnected
	pc.OnICEConnectionStateChange(func(connectionState webrtc.ICEConnectionState) {
		log.WithContext(ctx).Infof("Connection State has changed %s", connectionState.String())
	})

	pc.OnICECandidate(func(candidate *webrtc.ICECandidate) {
		log.WithContext(ctx).Infof("OnICECandidate %+v", candidate)
		if candidate == nil {
			return
		}

		init := candidate.ToJSON()
		data, err := json.Marshal(Message{Candidate: &init})
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to marshal ICECandidate")
			return
		}
		// TODO(vkorolik) this should be a send
		err = m.Broadcast(data)
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to send ICECandidate")
			return
		}
	})

	pc.OnNegotiationNeeded(func() {
		desc, err := pc.CreateOffer(&webrtc.OfferOptions{})
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to create offer")
			return
		}
		if err := pc.SetLocalDescription(desc); err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to set local description")
			return
		}
		log.WithContext(ctx).Infof("OnNegotiationNeeded")

		data, err := json.Marshal(Message{Description: pc.LocalDescription()})
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to marshal SessionDescription")
			return
		}
		// TODO(vkorolik) this should be a send
		err = m.Broadcast(data)
		if err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to send SessionDescription")
			return
		}
	})

	r.HandleFunc("/webrtc", func(w http.ResponseWriter, req *http.Request) {
		log.WithContext(ctx).WithError(err).Info("got websocket connection")
		if err := m.HandleRequest(w, req); err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to establish webrtc websocket connection")
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})

	m.HandleMessage(func(s *melody.Session, msg []byte) {
		log.WithContext(ctx).Infof("websocket message %s %+v", msg, s)
		var message Message
		if err := json.Unmarshal(msg, &message); err != nil {
			log.WithContext(ctx).WithError(err).Error("failed to unmarshal")
		}

		if message.Candidate != nil {
			if err = handleCandidate(ctx, pc, *message.Candidate); err != nil {
				log.WithContext(ctx).WithError(err).Error("failed to handle webrtc candidate")
			}
		} else if message.Description != nil {
			if err = handleDescription(ctx, pc, *message.Description); err != nil {
				log.WithContext(ctx).WithError(err).Error("failed to handle webrtc description")
			}

			data, err := json.Marshal(Message{Description: pc.LocalDescription()})
			if err != nil {
				log.WithContext(ctx).WithError(err).Error("failed to marshal SessionDescription")
				return
			}
			// TODO(vkorolik) this should be a send
			err = m.Broadcast(data)
			if err != nil {
				log.WithContext(ctx).WithError(err).Error("failed to send SessionDescription")
				return
			}
		}
		// TODO(vkorolik) should be a send
		_ = m.Broadcast([]byte("ok"))
	})
}

type webmSaver struct {
	audioWriter, videoWriter       webm.BlockWriteCloser
	audioBuilder, videoBuilder     *samplebuilder.SampleBuilder
	audioTimestamp, videoTimestamp time.Duration
}

func newWebmSaver() *webmSaver {
	return &webmSaver{
		audioBuilder: samplebuilder.New(10, &codecs.OpusPacket{}, 48000),
		videoBuilder: samplebuilder.New(10, &codecs.VP8Packet{}, 90000),
	}
}

func (s *webmSaver) Close(ctx context.Context) {
	log.WithContext(ctx).Infof("Finalizing webm...\n")
	if s.audioWriter != nil {
		if err := s.audioWriter.Close(); err != nil {
			panic(err)
		}
	}
	if s.videoWriter != nil {
		if err := s.videoWriter.Close(); err != nil {
			panic(err)
		}
	}
}
func (s *webmSaver) PushOpus(rtpPacket *rtp.Packet) {
	s.audioBuilder.Push(rtpPacket)

	for {
		sample := s.audioBuilder.Pop()
		if sample == nil {
			return
		}
		if s.audioWriter != nil {
			s.audioTimestamp += sample.Duration
			if _, err := s.audioWriter.Write(true, int64(s.audioTimestamp/time.Millisecond), sample.Data); err != nil {
				panic(err)
			}
		}
	}
}
func (s *webmSaver) PushVP8(ctx context.Context, rtpPacket *rtp.Packet) {
	s.videoBuilder.Push(rtpPacket)

	for {
		sample := s.videoBuilder.Pop()
		if sample == nil {
			return
		}
		// Read VP8 header.
		videoKeyframe := sample.Data[0]&0x1 == 0
		if videoKeyframe {
			// Keyframe has frame information.
			raw := uint(sample.Data[6]) | uint(sample.Data[7])<<8 | uint(sample.Data[8])<<16 | uint(sample.Data[9])<<24
			width := int(raw & 0x3FFF)
			height := int((raw >> 16) & 0x3FFF)

			if s.videoWriter == nil || s.audioWriter == nil {
				// Initialize WebM saver using received frame size.
				s.InitWriter(ctx, width, height)
			}
		}
		if s.videoWriter != nil {
			s.videoTimestamp += sample.Duration
			if _, err := s.videoWriter.Write(videoKeyframe, int64(s.videoTimestamp/time.Millisecond), sample.Data); err != nil {
				panic(err)
			}
		}
	}
}
func (s *webmSaver) InitWriter(ctx context.Context, width, height int) {
	w, err := os.OpenFile("test.webm", os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		panic(err)
	}

	ws, err := webm.NewSimpleBlockWriter(w,
		[]webm.TrackEntry{
			{
				Name:            "Audio",
				TrackNumber:     1,
				TrackUID:        12345,
				CodecID:         "A_OPUS",
				TrackType:       2,
				DefaultDuration: 20000000,
				Audio: &webm.Audio{
					SamplingFrequency: 48000.0,
					Channels:          2,
				},
			}, {
				Name:            "Video",
				TrackNumber:     2,
				TrackUID:        67890,
				CodecID:         "V_VP8",
				TrackType:       1,
				DefaultDuration: 33333333,
				Video: &webm.Video{
					PixelWidth:  uint64(width),
					PixelHeight: uint64(height),
				},
			},
		})
	if err != nil {
		panic(err)
	}
	log.WithContext(ctx).Infof("WebM saver has started with video width=%d, height=%d\n", width, height)
	s.audioWriter = ws[0]
	s.videoWriter = ws[1]
}

func createConn(ctx context.Context, saver *webmSaver) (*webrtc.PeerConnection, error) {
	log.WithContext(ctx).Info("creating webrtc conn")

	// Prepare the configuration
	config := webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{"stun:stun.l.google.com:19302"},
			},
		},
	}

	// Create a MediaEngine object to configure the supported codec
	m := &webrtc.MediaEngine{}

	// Setup the codecs you want to use.
	// Only support VP8 and OPUS, this makes our WebM muxer code simpler
	if err := m.RegisterCodec(webrtc.RTPCodecParameters{
		RTPCodecCapability: webrtc.RTPCodecCapability{MimeType: "video/VP8", ClockRate: 90000, Channels: 0, SDPFmtpLine: "", RTCPFeedback: nil},
		PayloadType:        96,
	}, webrtc.RTPCodecTypeVideo); err != nil {
		return nil, err
	}
	if err := m.RegisterCodec(webrtc.RTPCodecParameters{
		RTPCodecCapability: webrtc.RTPCodecCapability{MimeType: "audio/opus", ClockRate: 48000, Channels: 0, SDPFmtpLine: "", RTCPFeedback: nil},
		PayloadType:        111,
	}, webrtc.RTPCodecTypeAudio); err != nil {
		return nil, err
	}

	// Create the API object with the MediaEngine
	api := webrtc.NewAPI(webrtc.WithMediaEngine(m))

	// Create a new RTCPeerConnection
	peerConnection, err := api.NewPeerConnection(config)
	if err != nil {
		return nil, err
	}

	// Set a handler for when a new remote track starts, this handler copies inbound RTP packets,
	// replaces the SSRC and sends them back
	peerConnection.OnTrack(func(track *webrtc.TrackRemote, receiver *webrtc.RTPReceiver) {
		// Send a PLI on an interval so that the publisher is pushing a keyframe every rtcpPLIInterval
		go func() {
			ticker := time.NewTicker(time.Second * 3)
			for range ticker.C {
				errSend := peerConnection.WriteRTCP([]rtcp.Packet{&rtcp.PictureLossIndication{MediaSSRC: uint32(track.SSRC())}})
				if errSend != nil {
					log.Info(errSend)
				}
			}
		}()

		log.WithContext(ctx).Infof("Track has started, of type %d: %s \n", track.PayloadType(), track.Codec().RTPCodecCapability.MimeType)
		for {
			// Read RTP packets being sent to Pion
			rtp, _, readErr := track.ReadRTP()
			if readErr != nil {
				if readErr == io.EOF {
					return
				}
				panic(readErr)
			}
			switch track.Kind() {
			case webrtc.RTPCodecTypeAudio:
				saver.PushOpus(rtp)
			case webrtc.RTPCodecTypeVideo:
				saver.PushVP8(ctx, rtp)
			}
		}
	})

	return peerConnection, nil
}

func handleCandidate(ctx context.Context, peerConnection *webrtc.PeerConnection, candidate webrtc.ICECandidateInit) error {
	if err := peerConnection.AddICECandidate(candidate); err != nil {
		return err
	}
	return nil
}

func handleDescription(ctx context.Context, peerConnection *webrtc.PeerConnection, desc webrtc.SessionDescription) error {
	// Set the remote SessionDescription
	err := peerConnection.SetRemoteDescription(desc)
	if err != nil {
		return err
	}

	if desc.Type != webrtc.SDPTypeOffer {
		return nil
	}

	// Create an answer
	answer, err := peerConnection.CreateAnswer(nil)
	if err != nil {
		return err
	}

	// Create channel that is blocked until ICE Gathering is complete
	gatherComplete := webrtc.GatheringCompletePromise(peerConnection)

	// Sets the LocalDescription, and starts our UDP listeners
	err = peerConnection.SetLocalDescription(answer)
	if err != nil {
		return err
	}

	// Block until ICE Gathering is complete, disabling trickle ICE
	// we do this because we only can exchange one signaling message
	// in a production application you should exchange ICE Candidates via OnICECandidate
	<-gatherComplete

	return nil
}
