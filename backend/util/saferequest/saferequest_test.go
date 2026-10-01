package saferequest

import (
	"context"
	"errors"
	"net"
	"testing"
)

func TestIsPublicIP(t *testing.T) {
	blocked := []string{
		"127.0.0.1", "::1", // loopback
		"10.0.0.1", "172.16.0.1", "192.168.1.1", // RFC1918 private
		"169.254.169.254",        // link-local
		"::ffff:169.254.169.254", // IPv4-mapped link-local
		"0.0.0.0", "0.0.0.1",     // unspecified / this-network
		"100.64.0.1",   // CGNAT
		"192.0.0.1",    // IETF protocol assignments
		"192.0.2.1",    // TEST-NET-1
		"198.18.0.1",   // benchmarking
		"198.51.100.1", // TEST-NET-2
		"203.0.113.1",  // TEST-NET-3
		"240.0.0.1",    // reserved
		"224.0.0.1",    // multicast
		"fc00::1",      // ULA private
		"fe80::1",      // link-local
	}
	for _, s := range blocked {
		if IsPublicIP(net.ParseIP(s)) {
			t.Errorf("%s should be blocked (non-public)", s)
		}
	}

	allowed := []string{
		"1.1.1.1", "8.8.8.8", "93.184.216.34", "2606:2800:220:1:248:1893:25c8:1946",
	}
	for _, s := range allowed {
		if !IsPublicIP(net.ParseIP(s)) {
			t.Errorf("%s should be allowed (public)", s)
		}
	}

	if IsPublicIP(nil) {
		t.Error("nil IP should not be considered public")
	}
}

func TestDialContextBlocksPrivateResolution(t *testing.T) {
	// localhost resolves to a loopback address; the dial must be rejected
	// before any connection is attempted.
	_, err := DialContext(context.Background(), "tcp", "localhost:80") // DevSkim: ignore DS162092
	if err == nil {
		t.Fatal("expected dial to localhost to be blocked")
	}
	if !errors.Is(err, ErrBlockedAddress) {
		t.Errorf("expected ErrBlockedAddress, got %v", err)
	}
}
