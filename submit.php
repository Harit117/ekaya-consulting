<?php
/**
 * Ekaya Consulting — form handler
 * Emails Contact / Partner / Newsletter submissions. No external service.
 * Runs on any PHP host (e.g. Hostinger). Not supported on GitHub Pages.
 */

header('Content-Type: application/json; charset=utf-8');

/* ------------------------------------------------------------------ CONFIG */
// Where enquiries are delivered:
$recipients = array(
  'sales@ekayaconsulting.com',
  'harityatinraval@gmail.com',
);

// "From" should be an address on YOUR domain for good deliverability.
// Create this mailbox or alias in Hostinger → Emails (e.g. no-reply@ekayaconsulting.com).
$from_email = 'no-reply@ekayaconsulting.com';
$from_name  = 'Ekaya Consulting Website';
/* -------------------------------------------------------------------------- */

function respond($ok, $message, $code = 200) {
  http_response_code($code);
  echo json_encode(array('success' => $ok, 'message' => $message));
  exit;
}

// Only POST
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  respond(false, 'Method not allowed.', 405);
}

// Honeypot — bots fill hidden fields; humans don't. Silently accept & drop.
if (!empty($_POST['botcheck'])) {
  respond(true, 'Thank you.');
}

// Strip header-injection characters
function clean($v) {
  return trim(str_replace(array("\r", "\n", "%0a", "%0d"), ' ', (string) $v));
}

$name       = clean($_POST['name'] ?? '');
$email      = clean($_POST['email'] ?? '');
$subject_in = clean($_POST['subject'] ?? 'New Website Enquiry — Ekaya Consulting');

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  respond(false, 'Please enter a valid email address.', 422);
}

// Build the body from every submitted field (excluding internal ones)
$skip  = array('botcheck', 'subject');
$lines = array();
foreach ($_POST as $key => $value) {
  if (in_array($key, $skip, true)) continue;
  if (is_array($value)) $value = implode(', ', $value);
  $value = clean($value);
  if ($value === '') continue;
  $label   = ucwords(str_replace(array('_', '-'), ' ', $key));
  $lines[] = $label . ': ' . $value;
}

$body  = "You have a new submission from the Ekaya Consulting website:\n\n";
$body .= implode("\n", $lines);
$body .= "\n\n—\nSent automatically from the website forms.";

// Headers
$headers  = 'From: ' . $from_name . ' <' . $from_email . ">\r\n";
$reply    = $name !== '' ? ($name . ' <' . $email . '>') : $email;
$headers .= 'Reply-To: ' . $reply . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$to      = implode(', ', $recipients);
$subject = '=?UTF-8?B?' . base64_encode($subject_in) . '?=';

if (@mail($to, $subject, $body, $headers)) {
  respond(true, 'Thank you! Your message has been sent.');
} else {
  respond(false, 'Sorry, the message could not be sent. Please email sales@ekayaconsulting.com.', 500);
}
