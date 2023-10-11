
pub mod sdk {
    pub const SDK_NAME: &str = env!("CARGO_PKG_NAME");
    pub const SDK_VERSION: &str = env!("CARGO_PKG_VERSION");
    pub const SDK_LANGUAGE: &str = "rust";
}

pub mod os {
    use sysinfo::{System, SystemExt};

    pub const HOST_ARCH: &str = std::env::consts::ARCH;

    pub fn os_name() -> String {
        let sys = System::new();
        sys.long_os_version().unwrap_or(String::default())
    }

    pub fn os_version() -> String {
        let sys = System::new();
        sys.kernel_version().unwrap_or(String::default())
    }
}