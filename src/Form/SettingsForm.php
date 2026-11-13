<?php

declare(strict_types=1);

namespace Drupal\cookieconsent_lite\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\ConfigTarget;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configures the cookie consent banner.
 */
final class SettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'cookieconsent_lite_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return ['cookieconsent_lite.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form['measurement_id'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Google Analytics 4 measurement ID'),
      '#description' => $this->t('For example G-XXXXXXXXXX. The banner is hidden while this is empty.'),
      '#config_target' => new ConfigTarget(
        'cookieconsent_lite.settings',
        'measurement_id',
        toConfig: fn(string $value): string => strtoupper(trim($value)),
      ),
    ];
    $form['title'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Title'),
      '#config_target' => 'cookieconsent_lite.settings:title',
    ];
    $form['message'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Message'),
      '#rows' => 3,
      '#required' => TRUE,
      '#config_target' => 'cookieconsent_lite.settings:message',
    ];
    $form['accept_text'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Accept button'),
      '#required' => TRUE,
      '#config_target' => 'cookieconsent_lite.settings:accept_text',
    ];
    $form['decline_text'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Decline button'),
      '#required' => TRUE,
      '#config_target' => 'cookieconsent_lite.settings:decline_text',
    ];
    $form['read_more_text'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Read more link text'),
      '#config_target' => 'cookieconsent_lite.settings:read_more_text',
    ];
    $form['read_more_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Read more link URL'),
      '#description' => $this->t('An internal path such as /privacy or a full URL. The link shows only when both its URL and its text are filled in.'),
      '#maxlength' => 2048,
      '#config_target' => new ConfigTarget(
        'cookieconsent_lite.settings',
        'read_more_url',
        toConfig: fn(string $value): string => trim($value),
      ),
    ];
    $form['expiry_days'] = [
      '#type' => 'number',
      '#title' => $this->t('Consent lifetime'),
      '#field_suffix' => $this->t('days'),
      '#min' => 1,
      '#max' => 395,
      '#required' => TRUE,
      '#config_target' => 'cookieconsent_lite.settings:expiry_days',
    ];
    return parent::buildForm($form, $form_state);
  }

}
