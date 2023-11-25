<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t('pages.DashboardPage.' + relativePath);
};
</script>

<template>
  <q-page class="row justify-evenly q-pa-lg">
    <q-card class="col-10" flat>
      <q-card-section class="text-h4 text-white text-center">
        {{i18n('labels.title')}}
      </q-card-section>
      <q-card-section class="text-h6 text-grey text-center">
        {{i18n('labels.intro')}}
      </q-card-section>
      <q-card-section>
        <q-chat-message
          name="me"
          avatar="https://cdn.quasar.dev/img/avatar3.jpg"
          :text="['hey, how are you?']"
          stamp="7 minutes ago"
          sent
          bg-color="amber-7"
        />
        <q-chat-message
          name="Jane"
          avatar="https://cdn.quasar.dev/img/avatar5.jpg"
          :text="[
            'doing fine, how r you?',
            'I just feel like typing a really, really, REALLY long message to annoy you...',
          ]"
          size="6"
          stamp="4 minutes ago"
          text-color="white"
          bg-color="primary"
        />
        <q-chat-message
          name="Jane"
          avatar="https://cdn.quasar.dev/img/avatar5.jpg"
          :text="['Did it work?']"
          stamp="1 minutes ago"
          size="8"
          text-color="white"
          bg-color="primary"
        />
      </q-card-section>
      <q-card-section>
        <div class="row q-gutter-x-sm full-width">
          <q-input class="col-grow" dense outlined rounded/>
          <q-btn color="primary" label="Send" rounded />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>
