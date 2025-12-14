<?php
/**
 * Plugin Name: Product CRUD
 * Plugin URI: https://example.com/product-crud
 * Description: Custom product management with REST API support
 * Version: 1.0.2
 * Author: CVHowlader
 * License: GPL-2.0+
 * Text Domain: product-crud
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Product_CRUD {
    
    public function __construct() {
        add_action('init', array($this, 'register_product_post_type'));
        add_action('rest_api_init', array($this, 'register_rest_fields'));
        
        // Add meta boxes for admin
        add_action('add_meta_boxes', array($this, 'add_product_meta_boxes'));
        add_action('save_post_product', array($this, 'save_product_meta'));
        
        // Handle meta fields on REST API save
        add_action('rest_insert_product', array($this, 'save_product_meta_rest'), 10, 3);
    }
    
    /**
     * Register Product Custom Post Type
     */
    public function register_product_post_type() {
        $labels = array(
            'name'                  => _x('Products', 'Post type general name', 'product-crud'),
            'singular_name'         => _x('Product', 'Post type singular name', 'product-crud'),
            'menu_name'             => _x('Products', 'Admin Menu text', 'product-crud'),
            'name_admin_bar'        => _x('Product', 'Add New on Toolbar', 'product-crud'),
            'add_new'               => __('Add New', 'product-crud'),
            'add_new_item'          => __('Add New Product', 'product-crud'),
            'new_item'              => __('New Product', 'product-crud'),
            'edit_item'             => __('Edit Product', 'product-crud'),
            'view_item'             => __('View Product', 'product-crud'),
            'all_items'             => __('All Products', 'product-crud'),
            'search_items'          => __('Search Products', 'product-crud'),
            'not_found'             => __('No products found.', 'product-crud'),
            'not_found_in_trash'    => __('No products found in Trash.', 'product-crud'),
        );
        
        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array('slug' => 'products'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => null,
            'menu_icon'          => 'dashicons-products',
            'supports'           => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
            'show_in_rest'       => true,
            'rest_base'          => 'products',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
        );
        
        register_post_type('product', $args);
    }
    
    /**
     * Add meta boxes for product fields
     */
    public function add_product_meta_boxes() {
        add_meta_box(
            'product_details',
            __('Product Details', 'product-crud'),
            array($this, 'product_details_meta_box'),
            'product',
            'normal',
            'high'
        );
    }
    
    /**
     * Display product details meta box
     */
    public function product_details_meta_box($post) {
        wp_nonce_field('product_meta_box', 'product_meta_box_nonce');
        
        $price = get_post_meta($post->ID, '_product_price', true);
        $sku = get_post_meta($post->ID, '_product_sku', true);
        $stock = get_post_meta($post->ID, '_product_stock', true);
        ?>
        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="product_price"><?php _e('Price', 'product-crud'); ?></label>
                </th>
                <td>
                    <input 
                        type="number" 
                        id="product_price" 
                        name="product_price" 
                        value="<?php echo esc_attr($price); ?>" 
                        step="0.01" 
                        min="0"
                        style="width: 100%; max-width: 300px;"
                        placeholder="0.00"
                    />
                </td>
            </tr>
            <tr>
                <th scope="row">
                    <label for="product_sku"><?php _e('SKU', 'product-crud'); ?></label>
                </th>
                <td>
                    <input 
                        type="text" 
                        id="product_sku" 
                        name="product_sku" 
                        value="<?php echo esc_attr($sku); ?>" 
                        style="width: 100%; max-width: 300px;"
                        placeholder="PRODUCT-001"
                    />
                </td>
            </tr>
            <tr>
                <th scope="row">
                    <label for="product_stock"><?php _e('Stock', 'product-crud'); ?></label>
                </th>
                <td>
                    <input 
                        type="number" 
                        id="product_stock" 
                        name="product_stock" 
                        value="<?php echo esc_attr($stock); ?>" 
                        min="0"
                        style="width: 100%; max-width: 300px;"
                        placeholder="0"
                    />
                </td>
            </tr>
        </table>
        <?php
    }
    
    /**
     * Save product meta data (from admin)
     */
    public function save_product_meta($post_id) {
        if (!isset($_POST['product_meta_box_nonce'])) {
            return;
        }
        
        if (!wp_verify_nonce($_POST['product_meta_box_nonce'], 'product_meta_box')) {
            return;
        }
        
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
        
        // Save price
        if (isset($_POST['product_price'])) {
            update_post_meta($post_id, '_product_price', floatval($_POST['product_price']));
        }
        
        // Save SKU
        if (isset($_POST['product_sku'])) {
            update_post_meta($post_id, '_product_sku', sanitize_text_field($_POST['product_sku']));
        }
        
        // Save stock
        if (isset($_POST['product_stock'])) {
            update_post_meta($post_id, '_product_stock', intval($_POST['product_stock']));
        }
    }
    
    /**
     * Save product meta data from REST API
     */
    public function save_product_meta_rest($post, $request, $creating) {
        $params = $request->get_params();
        
        // Check if meta fields are in the request
        if (isset($params['meta'])) {
            // Save from meta object
            if (isset($params['meta']['_product_price'])) {
                update_post_meta($post->ID, '_product_price', floatval($params['meta']['_product_price']));
            }
            if (isset($params['meta']['_product_sku'])) {
                update_post_meta($post->ID, '_product_sku', sanitize_text_field($params['meta']['_product_sku']));
            }
            if (isset($params['meta']['_product_stock'])) {
                update_post_meta($post->ID, '_product_stock', intval($params['meta']['_product_stock']));
            }
        }
        
        // Also check top-level fields
        if (isset($params['price'])) {
            update_post_meta($post->ID, '_product_price', floatval($params['price']));
        }
        if (isset($params['sku'])) {
            update_post_meta($post->ID, '_product_sku', sanitize_text_field($params['sku']));
        }
        if (isset($params['stock'])) {
            update_post_meta($post->ID, '_product_stock', intval($params['stock']));
        }
    }
    
    /**
     * Register custom REST API fields
     */
    public function register_rest_fields() {
        // Register price field
        register_rest_field('product', 'price', array(
            'get_callback' => function($post) {
                $price = get_post_meta($post['id'], '_product_price', true);
                return $price !== '' ? floatval($price) : 0;
            },
            'update_callback' => function($value, $post) {
                update_post_meta($post->ID, '_product_price', floatval($value));
                return true;
            },
            'schema' => array(
                'type' => 'number',
                'description' => 'Product price',
                'context' => array('view', 'edit'),
            ),
        ));
        
        // Register SKU field
        register_rest_field('product', 'sku', array(
            'get_callback' => function($post) {
                $sku = get_post_meta($post['id'], '_product_sku', true);
                return $sku !== '' ? $sku : '';
            },
            'update_callback' => function($value, $post) {
                update_post_meta($post->ID, '_product_sku', sanitize_text_field($value));
                return true;
            },
            'schema' => array(
                'type' => 'string',
                'description' => 'Product SKU',
                'context' => array('view', 'edit'),
            ),
        ));
        
        // Register stock field
        register_rest_field('product', 'stock', array(
            'get_callback' => function($post) {
                $stock = get_post_meta($post['id'], '_product_stock', true);
                return $stock !== '' ? intval($stock) : 0;
            },
            'update_callback' => function($value, $post) {
                update_post_meta($post->ID, '_product_stock', intval($value));
                return true;
            },
            'schema' => array(
                'type' => 'integer',
                'description' => 'Product stock quantity',
                'context' => array('view', 'edit'),
            ),
        ));
    }
}

// Initialize the plugin
new Product_CRUD();
