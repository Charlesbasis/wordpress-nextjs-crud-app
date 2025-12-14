<?php

class Product_CRUD_Webhooks
{
    public function setup_webhooks()
    {
        add_action('save_post_product', [$this, 'trigger_webhook'], 20, 3);
        add_action('delete_post', [$this, 'trigger_delete_webhook'], 10, 2);
    }

    public function trigger_webhook($post_id, $post, $update)
    {
        // Don't trigger on autosave
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)
            return;

        $webhook_url = get_option('nextjs_webhook_url');
        if (!$webhook_url)
            return;

        // Send async request to Next.js revalidation endpoint
        wp_remote_post($webhook_url . '/api/revalidate', [
            'body' => json_encode([
                'secret' => get_option('nextjs_revalidate_secret'),
                'path' => '/products/' . $post_id,
                'type' => $update ? 'update' : 'create'
            ]),
            'headers' => ['Content-Type' => 'application/json'],
            'blocking' => false, // Don't wait for response
        ]);
    }
}
