<?php
/**
 * Plugin Name: Highlight.io Session Recording
 * Plugin URI: https://highlight.io/docs/wordpress
 * Description: Enables Highlight.io on your WordPress site. Can be used for session recording, error monitoring, and more.
 * Version: 1.0.0
 * Author: Highlight.io
 * Author URI: https://highlight.io
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Highlight_WP_Plugin {
    private $options;

    public function __construct() {
        add_action('admin_menu', array($this, 'add_plugin_page'));
        add_action('admin_init', array($this, 'page_init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_highlight_script'));
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), array($this, 'add_settings_link'));
    }

    public function add_plugin_page() {
        add_options_page(
            'Highlight.io Settings',
            'Highlight.io',
            'manage_options',
            'highlight-wp-settings',
            array($this, 'create_admin_page')
        );
    }

    public function create_admin_page() {
        $this->options = get_option('highlight_wp_options');
        ?>
        <div class="wrap">
            <h1>Highlight.io Settings</h1>
            <form method="post" action="options.php">
            <?php
                settings_fields('highlight_wp_option_group');
                do_settings_sections('highlight-wp-settings');
                wp_nonce_field('highlight_wp_settings_nonce', 'highlight_wp_settings_nonce');
                submit_button();
            ?>
            </form>
        </div>
        <?php
    }

    public function page_init() {
        register_setting(
            'highlight_wp_option_group',
            'highlight_wp_options',
            array($this, 'sanitize')
        );

        add_settings_section(
            'highlight_wp_setting_section',
            'Highlight.io Configuration',
            array($this, 'section_info'),
            'highlight-wp-settings'
        );

        add_settings_field(
            'project_id',
            'Project ID (required)',
            array($this, 'project_id_callback'),
            'highlight-wp-settings',
            'highlight_wp_setting_section'
        );

        add_settings_field(
            'service_name',
            'Service Name',
            array($this, 'service_name_callback'),
            'highlight-wp-settings',
            'highlight_wp_setting_section'
        );

        add_settings_field(
            'tracing_origins',
            'Tracing Origins',
            array($this, 'tracing_origins_callback'),
            'highlight-wp-settings',
            'highlight_wp_setting_section'
        );

        add_settings_field(
            'enable_network_recording',
            'Enable Network Recording',
            array($this, 'enable_network_recording_callback'),
            'highlight-wp-settings',
            'highlight_wp_setting_section'
        );

        add_settings_field(
            'backend_url',
            'Backend URL',
            array($this, 'backend_url_callback'),
            'highlight-wp-settings',
            'highlight_wp_setting_section'
        );
    }

    public function sanitize($input) {
        $nonce = isset($_POST['highlight_wp_settings_nonce']) ? sanitize_text_field(wp_unslash($_POST['highlight_wp_settings_nonce'])) : '';
        if (!wp_verify_nonce($nonce, 'highlight_wp_settings_nonce')) {
            add_settings_error('highlight_wp_messages', 'highlight_wp_message', __('Invalid nonce specified', 'highlight-io-session-recording'), 'error');
            return get_option('highlight_wp_options');
        }

        $sanitary_values = array();
        if (isset($input['project_id'])) {
            $sanitary_values['project_id'] = sanitize_text_field($input['project_id']);
        }
        if (isset($input['service_name'])) {
            $sanitary_values['service_name'] = sanitize_text_field($input['service_name']);
        }
        if (isset($input['tracing_origins'])) {
            $sanitary_values['tracing_origins'] = sanitize_textarea_field($input['tracing_origins']);
        }
        if (isset($input['enable_network_recording'])) {
            $sanitary_values['enable_network_recording'] = isset($input['enable_network_recording']) ? (bool)$input['enable_network_recording'] : false;
        }
        if (isset($input['backend_url'])) {
            $sanitary_values['backend_url'] = esc_url_raw($input['backend_url']);
        }
        return $sanitary_values;
    }

    public function section_info() {
        echo 'Enter your Highlight project settings below. Learn more about these settings in the <a href="https://www.highlight.io/docs/sdk/client#Hinit" target="_blank">Highlight docs</a>.';
    }

    public function project_id_callback() {
        printf(
            '<input type="text" id="project_id" name="highlight_wp_options[project_id]" value="%s" required />',
            isset($this->options['project_id']) ? esc_attr($this->options['project_id']) : ''
        );
        echo '<p class="description">Your Highlight Project ID. Can be found in your <a href="https://app.highlight.io/setup" target="_blank">Highlight project settings</a>.</p>';
    }

    public function service_name_callback() {
        printf(
            '<input type="text" id="service_name" name="highlight_wp_options[service_name]" value="%s" />',
            isset($this->options['service_name']) ? esc_attr($this->options['service_name']) : 'highlight-wordpress'
        );
        echo '<p class="description">Optional: Set the service name. Helpful for filtering data in Highlight.</p>';
    }

    public function tracing_origins_callback() {
        printf(
            '<textarea id="tracing_origins" name="highlight_wp_options[tracing_origins]" rows="3" cols="50">%s</textarea>',
            isset($this->options['tracing_origins']) ? esc_textarea($this->options['tracing_origins']) : 'true'
        );
        echo '<p class="description">Optional: Enter tracing origins, one per line. Use "true" to trace all origins.</p>';
    }

    public function enable_network_recording_callback() {
        $checked = isset($this->options['enable_network_recording']) ? $this->options['enable_network_recording'] : true;
        printf(
            '<input type="checkbox" id="enable_network_recording" name="highlight_wp_options[enable_network_recording]" value="1" %s />',
            checked($checked, true, false)
        );
        echo '<p class="description">Optional: Capture network requests and responses. These can be viewed in the "Network" tab when watching a session.</p>';
    }

    public function backend_url_callback() {
        printf(
            '<input type="url" id="backend_url" name="highlight_wp_options[backend_url]" value="%s" />',
            isset($this->options['backend_url']) ? esc_url($this->options['backend_url']) : ''
        );
        echo '<p class="description">Optional: Use a custom backend URL. Useful if you are self-hosting Highlight.</p>';
    }

    public function enqueue_highlight_script() {
        $options = get_option('highlight_wp_options');
        if (isset($options['project_id']) && !empty($options['project_id'])) {
            wp_enqueue_script('highlight-run', plugin_dir_url(__FILE__) . 'highlight.js', array(), '1.0.0', true);

            $highlight_config = array(
                'serviceName' => isset($options['service_name']) ? $options['service_name'] : 'highlight-wordpress',
                'tracingOrigins' => isset($options['tracing_origins']) ? $this->parse_tracing_origins($options['tracing_origins']) : 'true',
                'networkRecording' => array(
                    'enabled' => isset($options['enable_network_recording']) ? (bool)$options['enable_network_recording'] : false,
                    'recordHeadersAndBody' => true,
                ),
            );

            if (isset($options['backend_url']) && !empty($options['backend_url'])) {
                $highlight_config['backendUrl'] = $options['backend_url'];
            }

            $json_config = wp_json_encode($highlight_config, JSON_UNESCAPED_SLASHES);

            $init_script = sprintf(
                'H.init("%s", %s);',
                esc_js($options['project_id']),
                $json_config
            );

            wp_add_inline_script('highlight-run', $init_script, 'after');
        }
    }

    private function parse_tracing_origins($input) {
        $origins = array_map('trim', explode("\n", $input));
        if (in_array('true', $origins)) {
            return 'true';
        }
        return wp_json_encode($origins);
    }

    public function add_settings_link($links) {
        $settings_link = '<a href="' . admin_url('options-general.php?page=highlight-wp-settings') . '">Settings</a>';
        array_unshift($links, $settings_link);
        return $links;
    }
}

if (class_exists('Highlight_WP_Plugin')) {
    $highlight_wp_plugin = new Highlight_WP_Plugin();
}

// Activation hook
register_activation_hook(__FILE__, 'highlight_wp_plugin_activate');

function highlight_wp_plugin_activate() {
    add_option('highlight_wp_plugin_do_activation_redirect', true);
}

// Redirect hook
add_action('admin_init', 'highlight_wp_plugin_redirect');

function highlight_wp_plugin_redirect() {
    if (get_option('highlight_wp_plugin_do_activation_redirect', false)) {
        delete_option('highlight_wp_plugin_do_activation_redirect');
        wp_redirect(admin_url('options-general.php?page=highlight-wp-settings'));
        exit;
    }
}
